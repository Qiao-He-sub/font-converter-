'use client';

import React, { useState } from 'react';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FormatOption {
  value: string;
  label: string;
}

const formatOptions: FormatOption[] = [
  { value: 'woff2', label: 'WOFF2' },
  { value: 'woff', label: 'WOFF' },
  { value: 'ttf', label: 'TTF' },
  { value: 'otf', label: 'OTF' },
];

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState('woff2');
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      // 只上传第一个文件，字段名为 file
      formData.append('file', files[0]);
      formData.append('target_format', targetFormat);
      const response = await fetch('https://font-converter-api.onrender.com/convert', {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        let errorMsg = '转换失败';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {
          errorMsg = '服务器错误或无响应';
        }
        throw new Error(errorMsg);
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
    <main className="min-h-screen p-8 bg-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Font Format Batch Converter</h1>
        <div className="bg-[#171717] rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-[#171717] border-[#252526] transition-colors duration-200 hover:bg-[#222224]">
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
                <span className="text-gray-400">
                  {files.length > 0
                    ? files.map((f) => f.name).join(", ")
                    : "Click or drag font files here (multiple supported)"}
                </span>
              </label>
            </div>
            {/* 转换选项 */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Target Format</label>
              <div className="relative w-full">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-lg border border-[#252526] bg-[#232323] text-white shadow-md px-4 py-2 transition-all duration-200 focus:outline-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                >
                  <span>{formatOptions.find(opt => opt.value === targetFormat)?.label}</span>
                  <ChevronDownIcon className="h-5 w-5 text-[#FF006F] ml-2" />
                </button>
                {dropdownOpen && (
                  <ul className="absolute z-10 mt-1 w-full bg-[#232323] border border-[#252526] rounded-lg shadow-lg">
                    {formatOptions.map((opt) => (
                      <li
                        key={opt.value}
                        className={`px-4 py-2 cursor-pointer hover:bg-[#252526] ${targetFormat === opt.value ? 'text-[#FF006F]' : 'text-white'}`}
                        onClick={() => {
                          setTargetFormat(opt.value);
                          setDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF006F] hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF006F] disabled:opacity-50"
            >
              {converting ? (
                'Converting...'
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Batch Convert & Download ZIP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 