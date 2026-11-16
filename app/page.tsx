"use client";

import { useState, useEffect } from "react";
import JupyterIcon from "@/components/JupyterIcon";
import { 
  Folder, 
  Download, 
  Copy, 
  FileText, 
  Book, 
  Grid, 
  FileCode,
  ExternalLink 
} from "lucide-react";

interface FileItem {
  name: string;
  size: number;
  modified: number;
  type: string;
}

const INITIAL_FILES: FileItem[] = [
  { name: "DSBDA_Assignment2_Perfect.ipynb", size: 40725, modified: Date.now() - 3600000 * 2, type: ".ipynb" },
  { name: "ass1.ipynb", size: 17294, modified: Date.now() - 3600000 * 5, type: ".ipynb" },
  { name: "deep.ipynb", size: 208117, modified: Date.now() - 3600000 * 1, type: ".ipynb" },
  { name: "deeppy.py", size: 15155, modified: Date.now() - 3600000 * 1, type: ".py" },
  { name: "plotHEART.ipynb", size: 1164768, modified: Date.now() - 3600000 * 24, type: ".ipynb" },
];

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/files')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.files) && data.files.length > 0) {
          const sorted = [...data.files].sort((a, b) => a.name.localeCompare(b.name));
          setFiles(sorted);
        }
      })
      .catch((err) => {
        console.warn('Using default file list:', err);
      });
  }, []);

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

  const handleOpen = () => {
    selectedFiles.forEach((name) => {
      window.open(`/files/${encodeURIComponent(name)}`, '_blank');
    });
  };

  const handleDownload = (fileList?: string[]) => {
    const list = fileList && fileList.length > 0 ? fileList : Array.from(selectedFiles);
    list.forEach((name) => {
      const link = document.createElement('a');
      link.href = `/files/${encodeURIComponent(name)}`;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleCopySingleFile = async (filename: string) => {
    try {
      const res = await fetch(`/files/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('Failed to fetch file');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      alert(`Content of "${filename}" copied to clipboard!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to copy content of "${filename}".`);
    }
  };

  const handleCopyContent = async () => {
    if (selectedFiles.size !== 1) {
      alert("Please select exactly one file to copy its content.");
      return;
    }
    const filename = Array.from(selectedFiles)[0];
    await handleCopySingleFile(filename);
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

  const renderFileIcon = (file: FileItem, isSelected: boolean) => {
    if (file.type === '.ipynb') {
      return <Book className={`w-[18px] h-[18px] mr-2 shrink-0 fill-current ${isSelected ? 'text-white' : 'text-[#e67e22]'}`} />;
    }
    if (file.type === '.py') {
      return <FileCode className={`w-[18px] h-[18px] mr-2 shrink-0 ${isSelected ? 'text-white' : 'text-[#3572A5]'}`} />;
    }
    if (file.type === '.csv') {
      return <Grid className={`w-[18px] h-[18px] mr-2 shrink-0 fill-current ${isSelected ? 'text-white' : 'text-[#27ae60]'}`} />;
    }
    return <FileText className={`w-[18px] h-[18px] mr-2 shrink-0 fill-current ${isSelected ? 'text-white' : 'text-[#7f8c8d]'}`} />;
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
          <div className="flex flex-wrap items-center justify-between p-[15px] pb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {hasSelection ? (
                <>
                  <button className="jupyter-btn" onClick={handleOpen} title="Open selected files in new tab">
                    <ExternalLink className="w-4 h-4 mr-1 text-[#555]" /> Open
                  </button>
                  <button className="jupyter-btn" onClick={() => handleDownload()} title="Download selected files">
                    <Download className="w-4 h-4 mr-1 text-[#337ab7]" /> Download ({selectedFiles.size})
                  </button>
                  <button className="jupyter-btn" onClick={handleCopyContent} title="Copy contents of single selected file">
                    <Copy className="w-4 h-4 mr-1 text-[#555]" /> Copy Content
                  </button>
                  <button className="jupyter-btn text-gray-600 hover:text-black" onClick={() => setSelectedFiles(new Set())} title="Deselect all">
                    Clear Selection
                  </button>
                </>
              ) : (
                <>
                  <button className="jupyter-btn" onClick={() => handleDownload(files.map(f => f.name))} title="Download all files at once">
                    <Download className="w-4 h-4 mr-1 text-[#337ab7]" /> Download All Files
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{files.length} items</span>
            </div>
          </div>

          {/* Breadcrumb Row */}
          <div className="px-[15px] pb-[10px] flex items-center text-[14px] text-[#333]">
            <Folder className="w-[18px] h-[18px] mr-1.5 fill-current text-gray-500"/> / Downloads / archive /
          </div>

          {/* File List */}
          <div className="border-t border-[#ccc] flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#ccc] text-[13px] text-[#333] font-bold">
                  <th className="w-10 py-[8px] px-3 text-center border-r border-[#ccc]">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={files.length > 0 && selectedFiles.size === files.length} 
                      className="cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="py-[8px] px-3 font-normal text-[13px]">Name <span className="ml-1 text-[#555] text-[10px]">▲</span></th>
                  <th className="py-[8px] px-3 font-normal text-[13px] w-36">Modified</th>
                  <th className="py-[8px] px-3 font-normal text-[13px] w-28 text-right">File Size</th>
                  <th className="py-[8px] px-3 font-normal text-[13px] w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {files.map((file) => {
                  const isSelected = selectedFiles.has(file.name);
                  const textColor = isSelected ? 'text-white' : 'text-[#337ab7]';
                  const metaColor = isSelected ? 'text-white' : 'text-[#333]';
                  
                  return (
                    <tr 
                      key={file.name} 
                      className={`border-b border-[#ccc] transition-colors hover:bg-[#f5f5f5] ${isSelected ? 'bg-[#2196f3] text-white hover:bg-[#2196f3]' : ''}`}
                    >
                      <td className={`py-[8px] px-3 border-r border-[#ccc] text-center ${isSelected ? 'border-transparent' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleSelectFile(file.name)} 
                          className="cursor-pointer mt-1"
                        />
                      </td>
                      <td className="py-[8px] px-3">
                        <a
                          href={`/files/${encodeURIComponent(file.name)}`}
                          download={file.name}
                          className={`inline-flex items-center cursor-pointer hover:underline font-normal ${textColor}`}
                          title={`Click to download ${file.name}`}
                        >
                          {renderFileIcon(file, isSelected)}
                          <span>{file.name}</span>
                        </a>
                      </td>
                      <td className={`py-[8px] px-3 whitespace-nowrap text-[13px] ${metaColor}`}>{timeAgo(file.modified)}</td>
                      <td className={`py-[8px] px-3 text-right whitespace-nowrap text-[13px] ${metaColor}`}>{formatSize(file.size)}</td>
                      <td className="py-[8px] px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/files/${encodeURIComponent(file.name)}`}
                            download={file.name}
                            className={`px-2.5 py-1 text-xs border rounded shadow-sm transition-colors flex items-center gap-1 ${
                              isSelected 
                                ? 'bg-white text-[#2196f3] border-white hover:bg-gray-100 font-medium' 
                                : 'bg-white text-[#333] border-[#ccc] hover:bg-[#e6e6e6]'
                            }`}
                            title={`Download ${file.name}`}
                          >
                            <Download className="w-3.5 h-3.5 text-[#337ab7]" /> Download
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopySingleFile(file.name)}
                            className={`px-2 py-1 text-xs border rounded shadow-sm transition-colors flex items-center gap-1 ${
                              isSelected 
                                ? 'bg-white text-[#2196f3] border-white hover:bg-gray-100 font-medium' 
                                : 'bg-white text-[#333] border-[#ccc] hover:bg-[#e6e6e6]'
                            }`}
                            title={`Copy content of ${file.name}`}
                          >
                            <Copy className="w-3.5 h-3.5 text-[#555]" /> Copy
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {files.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      The notebook list is empty.
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
