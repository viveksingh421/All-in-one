import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  X,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  Maximize2,
  FolderOpen,
  Sparkles
} from 'lucide-react';

export const PdfDocumentHub = () => {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0] || null;

  const handleFileUpload = (files) => {
    const validPdfs = Array.from(files).filter(
      (file) => file.type === 'application/pdf' || file.name.endsWith('.pdf')
    );

    if (validPdfs.length === 0) return;

    const newDocs = validPdfs.map((file) => ({
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
      type: 'uploaded',
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
    setActiveDocId(newDocs[0].id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveDoc = (id, e) => {
    e.stopPropagation();
    const filtered = documents.filter((d) => d.id !== id);
    setDocuments(filtered);
    if (activeDocId === id && filtered.length > 0) {
      setActiveDocId(filtered[0].id);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col h-full">
      {/* Background radial accent */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl uppercase font-mono tracking-wider font-bold text-white">
              Document Hub & PDF Viewer
            </h3>
            <p className="text-sm sm:text-base text-starlight-200 font-mono mt-0.5">
              Research Papers, Academic Notes & Deep Space Guides
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2.5 rounded-xl bg-purple-500/25 border border-purple-400/50 hover:bg-purple-500/40 text-purple-100 text-sm sm:text-base font-mono font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Upload className="w-5 h-5" />
          <span>Upload PDF</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 mb-4 shrink-0 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01]'
            : 'border-white/15 bg-space-900/40 hover:border-purple-400/50 hover:bg-space-900/60'
        }`}
      >
        <div className="flex items-center justify-center gap-3 text-starlight-100">
          <Upload className="w-6 h-6 text-purple-400" />
          <span className="text-base sm:text-lg font-bold">Drop PDF documents here or click to browse</span>
        </div>
        <p className="text-sm text-starlight-300/80 font-mono mt-1.5 font-medium">
          Lab reports, textbook chapters, slides, and syllabus notes
        </p>
      </div>

      {/* Quick Tab Switcher for Documents */}
      {documents.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 custom-scrollbar shrink-0">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono whitespace-nowrap cursor-pointer transition-all border shrink-0 font-semibold ${
                  isActive
                    ? 'bg-purple-500/25 border-purple-400/60 text-white shadow-[0_0_15px_rgba(192,132,252,0.3)]'
                    : 'bg-space-900/50 border-white/10 text-starlight-300 hover:text-white hover:border-white/20'
                }`}
              >
                <FileText className={`w-4 h-4 ${isActive ? 'text-purple-300' : 'text-starlight-300/50'}`} />
                <span className="max-w-[150px] truncate">{doc.name}</span>
                {documents.length > 1 && (
                  <button
                    onClick={(e) => handleRemoveDoc(doc.id, e)}
                    className="p-1 rounded-full hover:bg-white/10 text-starlight-300 hover:text-rose-400 transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded PDF Viewer Window / Preview Box */}
      <div className="flex-1 min-h-[300px] rounded-2xl bg-space-950/80 border border-white/10 relative overflow-hidden flex flex-col shadow-inner">
        {activeDoc ? (
          <>
            {/* Top Bar for active document preview */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-space-900/80 border-b border-white/10 text-[11px] font-mono text-starlight-300">
              <span className="truncate max-w-[180px] text-white">{activeDoc.name}</span>
              <a
                href={activeDoc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 transition-colors"
                title="Open in new window"
              >
                <span>Full tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Embedded PDF Viewer */}
            <iframe
              src={`${activeDoc.url}#toolbar=0&navpanes=0`}
              title={activeDoc.name}
              className="w-full flex-1 border-none bg-slate-900/90"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-starlight-300/40 space-y-2">
            <FolderOpen className="w-8 h-8 stroke-1" />
            <p className="text-xs">No active document</p>
            <p className="text-[10px] font-mono">Upload a PDF above to preview it alongside your tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};
