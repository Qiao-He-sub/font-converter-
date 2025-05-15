import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import JSZip from 'jszip';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const targetFormat = formData.get('format') as string;

    if (!files.length) {
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 });
    }

    const tempDir = os.tmpdir();
    const zip = new JSZip();
    const tempFiles: string[] = [];

    for (const file of files) {
      const inputExt = path.extname(file.name) || '.font';
      const inputPath = path.join(tempDir, `${randomUUID()}${inputExt}`);
      const outputPath = path.join(tempDir, `${randomUUID()}.${targetFormat}`);
      tempFiles.push(inputPath, outputPath);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(inputPath, buffer);
      await new Promise((resolve, reject) => {
        const py = spawn('python3', [
          path.join(process.cwd(), 'convert_font.py'),
          inputPath,
          outputPath
        ]);
        let stderr = '';
        py.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        py.on('close', (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            reject(new Error(stderr || '字体转换失败'));
          }
        });
      });
      const outBuffer = await import('fs').then(fs => fs.readFileSync(outputPath));
      zip.file(
        `${file.name.replace(/\.[^.]+$/, '')}.${targetFormat}`,
        outBuffer
      );
    }

    // 生成zip包
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // 清理临时文件
    await Promise.all(tempFiles.map(f => unlink(f).catch(() => {})));

    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', 'attachment; filename="converted_fonts.zip"');
    return new NextResponse(zipBuffer, { headers });
  } catch (error: any) {
    console.error('批量转换错误:', error);
    return NextResponse.json({ error: error.message || '字体批量转换失败' }, { status: 500 });
  }
} 