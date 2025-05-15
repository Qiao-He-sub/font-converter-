'use client';

import { useState } from 'react';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState('woff2');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!files.length) return;
    
    setConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('format', targetFormat);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '转换失败');
      }

      // 下载zip包
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_fonts.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败');
    } finally {
      setConverting(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">字体格式批量转换工具</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".ttf,.otf,.woff,.woff2,.pfa"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                multiple
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-gray-600">
                  {files.length > 0
                    ? files.map((f) => f.name).join(", ")
                    : "点击或拖拽字体文件到这里（可多选）"}
                </span>
              </label>
            </div>

            {/* 转换选项 */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                目标格式
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="woff2">WOFF2</option>
                <option value="woff">WOFF</option>
                <option value="ttf">TTF</option>
                <option value="otf">OTF</option>
              </select>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* 转换按钮 */}
            <button
              onClick={handleConvert}
              disabled={!files.length || converting}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {converting ? (
                '批量转换中...'
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  批量转换并下载ZIP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 