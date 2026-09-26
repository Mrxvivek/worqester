import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { FileText, Download, Plus, Search, Tag, Trash2, Folder, ExternalLink, Pencil } from "lucide-react";
import { DocumentItem } from "../types";
import { EditDocumentModal } from "../components/modals/EditModals";
import { UploadDocumentModal } from "../components/modals/UploadDocumentModal";

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, updateDocument, deleteItem, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const title = doc.title || doc.name || "";
    const fileName = doc.fileName || doc.name || "";
    const tags = Array.isArray(doc.tags) ? doc.tags : [];
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      title.toLowerCase().includes(search) ||
      fileName.toLowerCase().includes(search) ||
      tags.some((t) => typeof t === "string" && t.toLowerCase().includes(search));

    const matchesTag = selectedTag === "all" || tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(
    new Set(documents.flatMap((d) => (Array.isArray(d.tags) ? d.tags.filter((t) => typeof t === "string") : [])))
  );

  const handleDownload = (doc: DocumentItem) => {
    const docTitle = doc.title || doc.name || "Untitled Document";
    const docFileName = doc.fileName || doc.name || `${docTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`;
    const docVersion = doc.version || "v1.0";
    const docUploadedBy = doc.uploadedBy || "Team Member";
    const docFileType = doc.fileType || (docFileName.includes(".") ? docFileName.split(".").pop() : "pdf") || "pdf";

    if (doc.url) {
      const a = document.createElement("a");
      a.href = doc.url;
      a.download = docFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `========================================\nWORQESTER ENTERPRISE DOCUMENT REPOSITORY\n========================================\n\nTitle: ${docTitle}\nFile: ${docFileName}\nVersion: ${docVersion}\nCategory: ${doc.category || "General"}\nUploaded By: ${docUploadedBy}\nDate: ${doc.uploadedAt || new Date().toISOString().split("T")[0]}\nTags: ${(Array.isArray(doc.tags) ? doc.tags : []).join(", ")}\n\n[Content stored in Worqester Enterprise Knowledge Store]`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docFileName.includes(".") ? docFileName : `${docFileName}.${docFileType}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Enterprise Knowledge & Documents
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
            Centralized repository for contracts, architecture briefs, and policies
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Tags Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by title, file name, or tag..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTag("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedTag === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === tag
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <Folder size={36} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {searchTerm || selectedTag !== "all" ? "No matching documents found" : "No documents uploaded yet"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedTag !== "all"
              ? "Try adjusting your search query or selected tag filter."
              : "Upload your first PDF, specification, or policy to get started."}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const docTitle = doc.title || doc.name || "Untitled Document";
            const docFileName = doc.fileName || doc.name || `${docTitle.toLowerCase().replace(/\s+/g, "_")}.pdf`;
            const docFileSize = doc.fileSize || doc.size || "1.5 MB";
            const docFileType = doc.fileType || (docFileName.includes(".") ? docFileName.split(".").pop() : "pdf") || "pdf";
            const docVersion = doc.version || "v1.0";
            const docTags = Array.isArray(doc.tags) ? doc.tags : [];
            const docUploadedBy = doc.uploadedBy || "Team Member";

            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md space-y-3.5 text-xs group hover:border-blue-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0 shadow-xs">
                        {docFileType.slice(0, 4)}
                      </div>
                      <div className="min-w-0">
                        <h4
                          onClick={() => setEditingDoc(doc)}
                          className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 cursor-pointer text-sm"
                        >
                          {docTitle}
                        </h4>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono block truncate">
                          {docFileName} • {docFileSize}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md font-bold border border-slate-300 dark:border-slate-700 shrink-0">
                      {docVersion}
                    </span>
                  </div>

                  {doc.category && (
                    <div className="inline-block">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
                        {doc.category}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {docTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="truncate max-w-[140px] font-medium" title={docUploadedBy}>
                    By {docUploadedBy}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                      title="Edit Document"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                      title="Download File"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${docTitle}"?`)) {
                          deleteItem("document", doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(newDoc) => {
          addDocument(newDoc);
        }}
        currentUser={currentUser}
      />

      {/* Edit Document Modal */}
      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          isOpen={true}
          onClose={() => setEditingDoc(null)}
          onSave={(updated) => {
            updateDocument(editingDoc.id, updated);
            setEditingDoc(null);
          }}
        />
      )}
    </div>
  );
};
