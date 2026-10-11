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
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-white">
              Document Hub & PDF Viewer
            </h3>
            <p className="text-[10px] text-starlight-300/60 font-mono">
              Research Papers, Notes & Guides
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-400/30 hover:bg-purple-500/25 text-purple-200 text-[11px] font-mono flex items-center gap-1 transition-all"
        >
          <Upload className="w-3 h-3" />
          <span>Upload</span>
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
        className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition-all duration-300 mb-3 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01]'
            : 'border-white/10 bg-space-900/30 hover:border-purple-400/40 hover:bg-space-900/50'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-starlight-300/80">
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium">Drop PDFs here or browse</span>
        </div>
        <p className="text-[10px] text-starlight-300/40 font-mono mt-0.5">
          Lab reports, lecture notes, textbook chapters
        </p>
      </div>

      {/* Quick Tab Switcher for Documents */}
      {documents.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 custom-scrollbar">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap cursor-pointer transition-all border shrink-0 ${
                  isActive
                    ? 'bg-purple-500/20 border-purple-400/50 text-white shadow-[0_0_12px_rgba(192,132,252,0.25)]'
                    : 'bg-space-900/40 border-white/5 text-starlight-300/60 hover:text-white hover:border-white/15'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-starlight-300/50'}`} />
                <span className="max-w-[110px] truncate">{doc.name}</span>
                {documents.length > 1 && (
                  <button
                    onClick={(e) => handleRemoveDoc(doc.id, e)}
                    className="p-0.5 rounded-full hover:bg-white/10 text-starlight-300/40 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
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
