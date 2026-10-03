import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  HelpCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { documentsApi } from '../api/client';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Q&A State
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<any | null>(null);

  const fetchDocs = async () => {
    try {
      const data = await documentsApi.list();
      setDocuments(data);
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      await documentsApi.upload(file);
      await fetchDocs();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete document and all indexed chunks?')) return;
    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
        setQaAnswer(null);
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !question.trim()) return;
    setAsking(true);
    setQaAnswer(null);
    try {
      const res = await documentsApi.ask(selectedDoc.id, question.trim());
      setQaAnswer(res);
    } catch (e: any) {
      setQaAnswer({ answer: `Error: ${e.message}`, sources: [] });
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <FileText className="h-6 w-6 text-cyan-400" />
          <span>Document Intelligence & RAG</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload PDF, Word, or Markdown files. Ask grounded questions with exact source and chunk citations.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div className="p-8 rounded-3xl bg-jarvis-card/80 border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 transition-all text-center">
        <UploadCloud className="h-10 w-10 text-cyan-400 mx-auto mb-3 animate-bounce" />
        <h3 className="text-sm font-semibold text-white mb-1">
          {uploading ? 'Processing & Indexing Chunks...' : 'Upload Document to Knowledge Base'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Supported formats: PDF, DOCX, TXT, Markdown (Max 10MB)
        </p>

        {uploadError && (
          <div className="mb-4 text-xs text-rose-400 flex items-center justify-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            <span>{uploadError}</span>
          </div>
        )}

        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 transition">
          <UploadCloud className="h-4 w-4" />
          <span>Select File to Upload</span>
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Document Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          Indexed Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-jarvis-card/40 border border-slate-800 text-slate-500 text-xs">
            No documents uploaded yet. Upload a syllabus, code document, or article to test RAG grounding.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-jarvis-card/90 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono uppercase">
                      {doc.file_type}
                    </span>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h4 className="text-sm font-semibold text-white truncate mb-1" title={doc.filename}>
                    {doc.filename}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mb-4">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      {doc.chunk_count} chunks indexed
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setQaAnswer(null);
                    setQuestion('');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-medium border border-slate-700/80 transition active:scale-95"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Ask Question (RAG)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RAG Q&A Drawer / Card */}
      {selectedDoc && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Grounded Q&A: <span className="text-cyan-300 font-normal">{selectedDoc.filename}</span>
              </h3>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleAskQuestion} className="flex gap-2 mb-6">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything grounded strictly in this document..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              {asking ? <span>Analyzing...</span> : <Send className="h-4 w-4" />}
            </button>
          </form>

          {qaAnswer && (
            <div className="p-5 rounded-2xl bg-jarvis-card border border-slate-800 space-y-4">
              <div>
                <h4 className="text-xs uppercase font-mono text-cyan-400 tracking-wider mb-2">Answer</h4>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {qaAnswer.answer}
                </p>
              </div>

              {qaAnswer.sources && qaAnswer.sources.length > 0 && (
                <div>
                  <h5 className="text-xs font-mono text-slate-400 mb-2">Cited Grounding Sources</h5>
                  <div className="space-y-2">
                    {qaAnswer.sources.map((src: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                        <span className="font-semibold text-cyan-300 mr-2">[Source {idx + 1}]</span>
                        <span className="text-slate-400">{src.snippet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
