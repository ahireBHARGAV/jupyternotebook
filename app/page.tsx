"use client";

import { useState, useEffect, useRef } from "react";
import JupyterIcon from "@/components/JupyterIcon";
import { Folder, File as FileIcon, Upload, RefreshCw, Trash2, Download, Copy, Plus, Filter, FileText, Book, Grid } from "lucide-react";

interface FileItem {
  name: string;
  size: number;
  modified: number;
  type: string;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data.files || []);
      setSelectedFiles(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      fetchFiles();
    } catch (error) {
      console.error("Upload failed", error);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles(new Set(files.map(f => f.name)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleSelectFile = (name: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedFiles(newSelected);
  };

  const handleDownload = () => {
    selectedFiles.forEach(name => {
      window.open(`/api/download?file=${encodeURIComponent(name)}`, "_blank");
    });
  };

  const handleCopyContent = async () => {
    if (selectedFiles.size !== 1) {
      alert("Please select exactly one file to copy its content.");
      return;
    }
    const filename = Array.from(selectedFiles)[0];
    try {
      const res = await fetch(`/api/content?file=${encodeURIComponent(filename)}`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      alert(`Content of ${filename} copied to clipboard!`);
    } catch (err) {
      console.error(err);
      alert("Failed to copy content.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete selected files?")) return;
    
    for (const filename of Array.from(selectedFiles)) {
      await fetch(`/api/files?file=${encodeURIComponent(filename)}`, { method: "DELETE" });
    }
    fetchFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const hasSelection = selectedFiles.size > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#eeeeee]">
      {/* Header */}
      <header className="bg-white px-[15px] pt-[10px] pb-[5px] flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center cursor-pointer">
            <JupyterIcon className="w-8 h-8 mr-2" />
            <span className="text-[22px] text-[#777] font-normal tracking-tight">jupyter</span>
          </div>
        </div>
      </header>

      {/* Menu Bar */}
      <nav className="px-[15px] py-0.5 border-b border-[#ccc] bg-white flex text-[14px] text-[#333] shadow-sm">
        <div className="px-3 py-1 cursor-pointer hover:bg-jupyter-lightGray rounded-sm">File</div>
        <div className="px-3 py-1 cursor-pointer hover:bg-jupyter-lightGray rounded-sm">View</div>
        <div className="px-3 py-1 cursor-pointer hover:bg-jupyter-lightGray rounded-sm">Settings</div>
        <div className="px-3 py-1 cursor-pointer hover:bg-jupyter-lightGray rounded-sm">Help</div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-[1140px] mx-auto w-full mt-4 px-[15px]">
        {/* Tabs */}
        <div className="flex border-b border-[#ccc]">
          <div className="px-4 py-2 bg-white border border-[#ccc] border-b-white rounded-t text-[#333] font-normal flex items-center gap-1 cursor-pointer -mb-px z-10 relative top-[1px]">
            <Folder className="w-4 h-4 fill-current text-[#555]" /> Files
          </div>
          <div className="px-4 py-2 text-[#333] rounded-t flex items-center gap-1 cursor-pointer border border-transparent">
            <div className="w-3 h-3 border-2 border-[#999] rounded-full"></div> Running
          </div>
        </div>

        {/* Toolbar Area */}
        <div className="bg-white border border-t-0 border-[#ccc] flex flex-col min-h-[500px] shadow-sm mb-10">
          
          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-start justify-between p-[15px] pb-2 gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {hasSelection && (
                <>
                  <button className="jupyter-btn">Open</button>
                  <button className="jupyter-btn" onClick={handleDownload}>Download</button>
                  <button className="jupyter-btn">Rename</button>
                  <button className="jupyter-btn">Duplicate</button>
                  <button className="jupyter-btn-danger ml-1" onClick={handleDelete}>Move to Trash</button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button className="jupyter-btn px-2"><Filter className="w-3.5 h-3.5" /></button>
              <div className="relative group">
                <button className="jupyter-btn">New <span className="ml-1 text-[10px]">▼</span></button>
              </div>
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button className="jupyter-btn" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5 mr-1" /> Upload
              </button>
              <button className="jupyter-btn px-2" onClick={fetchFiles}>
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Row */}
          <div className="px-[15px] pb-[10px] flex items-center text-[14px] text-[#333]">
            <Folder className="w-[18px] h-[18px] mr-1.5 fill-current text-gray-500"/> / Downloads / archive /
          </div>

          {/* File List */}
          <div className="border-t border-[#ccc] flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#ccc] text-[13px] text-[#333] font-bold">
                  <th className="w-10 py-[8px] px-3 text-center border-r border-[#ccc]">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={files.length > 0 && selectedFiles.size === files.length} 
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="py-[8px] px-3 font-normal text-[13px]">Name <span className="ml-1 text-[#555] text-[10px]">▲</span></th>
                  <th className="py-[8px] px-3 font-normal text-[13px] w-40">Modified</th>
                  <th className="py-[8px] px-3 font-normal text-[13px] w-28 text-right">File Size</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {files.map((file) => {
                  const isSelected = selectedFiles.has(file.name);
                  const textColor = isSelected ? 'text-white' : 'text-[#337ab7]';
                  const metaColor = isSelected ? 'text-white' : 'text-[#333]';
                  
                  return (
                    <tr key={file.name} className={`border-b border-[#ccc] hover:bg-[#f5f5f5] ${isSelected ? 'bg-[#2196f3] text-white hover:bg-[#2196f3]' : ''}`}>
                      <td className={`py-[8px] px-3 border-r border-[#ccc] text-center ${isSelected ? 'border-transparent' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleSelectFile(file.name)} 
                          className="cursor-pointer mt-1"
                        />
                      </td>
                      <td className={`py-[8px] px-3 flex items-center cursor-pointer hover:underline ${textColor}`}>
                        {file.type === '.ipynb' ? (
                          <Book className={`w-[18px] h-[18px] mr-2 fill-current ${isSelected ? 'text-white' : 'text-[#e67e22]'}`} />
                        ) : file.type === '.csv' ? (
                          <Grid className={`w-[18px] h-[18px] mr-2 fill-current ${isSelected ? 'text-white' : 'text-[#27ae60]'}`} />
                        ) : (
                          <FileText className={`w-[18px] h-[18px] mr-2 fill-current ${isSelected ? 'text-white' : 'text-[#7f8c8d]'}`} />
                        )}
                        {file.name}
                      </td>
                      <td className={`py-[8px] px-3 whitespace-nowrap ${metaColor}`}>{timeAgo(file.modified)}</td>
                      <td className={`py-[8px] px-3 text-right whitespace-nowrap ${metaColor}`}>{formatSize(file.size)}</td>
                    </tr>
                  );
                })}
                
                {files.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      The notebook list is empty. Click Upload to add files.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
