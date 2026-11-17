import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FolderPlus,
  FileText, 
  Search, 
  Eye, 
  Download, 
  X, 
  Plus, 
  FileCode,
  HardDrive,
  UploadCloud,
  FileCheck2,
  Edit3,
  Save,
  Trash2,
  Check,
  Code2,
  BookOpen,
  Star,
  Hash
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const DEFAULT_FOLDERS = [
  'Hardware & Schematics',
  'Deployment Guides',
  'Firmware & Tooling',
  'Curriculum & Lesson Plans',
  'Operational Protocols'
];

function renderInlineFormatting(text) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-950 border border-zinc-800 text-amber-300/90 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function MarkdownPreview({ content }) {
  const lines = (content || '').split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={index}
              className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200 pt-2"
            >
              {renderInlineFormatting(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={index}
              className="text-sm font-semibold text-zinc-100 pt-2.5 pb-1 border-b border-zinc-800/80"
            >
              {renderInlineFormatting(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2
              key={index}
              className="text-base font-semibold text-zinc-100 pt-1 pb-1.5 border-b border-zinc-800"
            >
              {renderInlineFormatting(trimmed.slice(2))}
            </h2>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2 shrink-0" />
              <span className="flex-1">{renderInlineFormatting(trimmed.slice(2))}</span>
            </div>
          );
        }
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={index} className="flex items-start gap-2 pl-1">
              <span className="font-mono tabular-nums text-[11px] text-zinc-400 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                {numberedMatch[1]}
              </span>
              <span className="flex-1">{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          );
        }
        return (
          <p key={index} className="text-zinc-300">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function DocumentExplorer({
  documents,
  setDocuments,
  focusedDocItem,
  onClearFocusedDoc,
  onLogActivity
}) {
  const [customFolders, setCustomFolders] = useState(() => {
    const saved = localStorage.getItem('ecospark_custom_folders');
    return saved ? JSON.parse(saved) : [];
  });
  const [pinnedDocIds, setPinnedDocIds] = useState(() => {
    const saved = localStorage.getItem('ecospark_pinned_docs');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedFolder, setSelectedFolder] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [previewMode, setPreviewMode] = useState('formatted');
  const [editForm, setEditForm] = useState({
    name: '',
    folder: '',
    tags: '',
    content: ''
  });

  const [pendingConfirm, setPendingConfirm] = useState(null);

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const [newDoc, setNewDoc] = useState({
    name: '',
    folder: 'Hardware & Schematics',
    category: 'Schematics',
    author: '',
    tags: '',
    content: ''
  });

  useEffect(() => {
    localStorage.setItem('ecospark_custom_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  useEffect(() => {
    localStorage.setItem('ecospark_pinned_docs', JSON.stringify(pinnedDocIds));
  }, [pinnedDocIds]);

  useEffect(() => {
    if (showNewFolderInput) {
      setTimeout(() => folderInputRef.current?.focus(), 40);
    }
  }, [showNewFolderInput]);

  useEffect(() => {
    if (focusedDocItem) {
      const latest = documents.find((d) => d.id === focusedDocItem.id) || focusedDocItem;
      openDocumentInspector(latest, false);
      if (onClearFocusedDoc) {
        onClearFocusedDoc();
      }
    }
  }, [focusedDocItem, documents, onClearFocusedDoc]);

  const docFolders = documents.map((d) => d.folder).filter(Boolean);
  const directoryList = Array.from(
    new Set([...DEFAULT_FOLDERS, ...customFolders, ...docFolders])
  );
  const folders = ['ALL', ...directoryList];

  const isGlobalFiltering = Boolean(searchTerm.trim()) || Boolean(selectedTag);

  const filteredDocs = documents
    .filter((doc) => {
      const matchesFolder =
        isGlobalFiltering || selectedFolder === 'ALL' || doc.folder === selectedFolder;
      const matchesTag =
        !selectedTag ||
        doc.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        doc.name.toLowerCase().includes(q) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        doc.author.toLowerCase().includes(q) ||
        (doc.content && doc.content.toLowerCase().includes(q));
      return matchesFolder && matchesTag && matchesSearch;
    })
    .sort((a, b) => {
      const aPinned = pinnedDocIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedDocIds.includes(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });

  const getFolderCount = (folderName) => {
    if (folderName === 'ALL') return documents.length;
    return documents.filter((d) => d.folder === folderName).length;
  };

  const togglePinDoc = (e, doc) => {
    if (e) e.stopPropagation();
    const alreadyPinned = pinnedDocIds.includes(doc.id);
    if (alreadyPinned) {
      setPinnedDocIds((prev) => prev.filter((id) => id !== doc.id));
      onLogActivity(`Unpinned "${doc.name}"`);
    } else {
      setPinnedDocIds((prev) => [doc.id, ...prev]);
      onLogActivity(`Pinned "${doc.name}" to top of vault`);
    }
  };

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    setSelectedTag((prev) =>
      prev && prev.toLowerCase() === tag.toLowerCase() ? null : tag
    );
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const exists = directoryList.some(
      (f) => f.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      const existingMatch = directoryList.find(
        (f) => f.toLowerCase() === trimmed.toLowerCase()
      );
      setSelectedFolder(existingMatch);
      setNewFolderName('');
      setShowNewFolderInput(false);
      return;
    }

    setCustomFolders((prev) => [...prev, trimmed]);
    setSelectedFolder(trimmed);
    onLogActivity(`Created new folder: "${trimmed}"`);
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const executeDeleteFolder = (folderName, count) => {
    if (count > 0) {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.folder === folderName ? { ...doc, folder: 'Operational Protocols' } : doc
        )
      );
    }
    setCustomFolders((prev) => prev.filter((f) => f !== folderName));
    if (selectedFolder === folderName) {
      setSelectedFolder('ALL');
    }
    onLogActivity(`Removed custom folder: "${folderName}"`);
  };

  const handleDeleteFolder = (e, folderName) => {
    e.stopPropagation();
    const count = getFolderCount(folderName);
    if (count === 0) {
      executeDeleteFolder(folderName, 0);
      return;
    }

    setPendingConfirm({
      title: `Remove "${folderName}"?`,
      message: `This folder has ${count} file(s). Removing it will move those files into "Operational Protocols".`,
      confirmLabel: 'Remove Folder',
      tone: 'danger',
      onConfirm: () => {
        executeDeleteFolder(folderName, count);
        setPendingConfirm(null);
      }
    });
  };

  const openDocumentInspector = (doc, startInEdit = false) => {
    setSelectedDoc(doc);
    setIsEditingDoc(startInEdit);
    setPreviewMode('formatted');
    setEditForm({
      name: doc.name,
      folder: doc.folder,
      tags: (doc.tags || []).join(', '),
      content: doc.content || ''
    });
  };

  const handleSaveDocEdits = (e) => {
    e.preventDefault();
    if (!selectedDoc || !editForm.name.trim()) return;

    const parsedTags = editForm.tags
      ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['General'];

    const updatedDoc = {
      ...selectedDoc,
      name: editForm.name.trim(),
      folder: editForm.folder || selectedDoc.folder,
      tags: parsedTags,
      content: editForm.content,
      size: `${(editForm.content.length / 1024 + 0.1).toFixed(1)} KB`,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
    setSelectedDoc(updatedDoc);
    setIsEditingDoc(false);
    onLogActivity(`Updated document "${updatedDoc.name}" (${updatedDoc.id})`);
  };

  const handleDeleteDocument = (doc) => {
    setPendingConfirm({
      title: 'Delete file from vault?',
      message: `"${doc.name}" will be permanently removed from your local workspace.`,
      confirmLabel: 'Delete File',
      tone: 'danger',
      onConfirm: () => {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        setPinnedDocIds((prev) => prev.filter((id) => id !== doc.id));
        if (selectedDoc?.id === doc.id) {
          setSelectedDoc(null);
          setIsEditingDoc(false);
        }
        onLogActivity(`Deleted document "${doc.name}" (${doc.id}) from vault`);
        setPendingConfirm(null);
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const processNativeFiles = (files) => {
    const targetFolder = selectedFolder === 'ALL' ? 'Operational Protocols' : selectedFolder;
    
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop().toUpperCase();
      const reader = new FileReader();

      reader.onload = (event) => {
        const textContent = typeof event.target.result === 'string' 
          ? event.target.result 
          : `Uploaded file "${file.name}" (${formatFileSize(file.size)}). Click Download File to save a copy.`;

        const newEntry = {
          id: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
          name: file.name,
          folder: targetFolder,
          category: ext || 'File',
          size: formatFileSize(file.size),
          updatedAt: new Date().toISOString().split('T')[0],
          author: 'Local Upload',
          tags: [ext || 'File', 'Uploaded'],
          content: textContent || 'Empty file.'
        };

        onLogActivity(`Uploaded file "${file.name}" into ${targetFolder}`);
        setDocuments((prev) => [newEntry, ...prev]);
      };

      if (file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processNativeFiles(e.dataTransfer.files);
    }
  };

  const handleManualFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processNativeFiles(e.target.files);
    }
  };

  const handleDownload = (doc) => {
    onLogActivity(`Downloaded file: "${doc.name}"`);
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openCreateNoteModal = () => {
    setNewDoc({
      name: '',
      folder: selectedFolder === 'ALL' ? 'Hardware & Schematics' : selectedFolder,
      category: 'Markdown',
      author: '',
      tags: '',
      content: ''
    });
    setShowAddModal(true);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!newDoc.name.trim() || !newDoc.author.trim()) return;
    setIsSubmitting(true);

    const parsedTags = newDoc.tags
      ? newDoc.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['General'];

    const createdDoc = {
      id: `DOC-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: newDoc.name.trim(),
      folder: newDoc.folder,
      category: newDoc.category,
      size: `${(newDoc.content.length / 1024 + 0.1).toFixed(1)} KB`,
      updatedAt: new Date().toISOString().split('T')[0],
      author: newDoc.author.trim(),
      tags: parsedTags,
      content: newDoc.content || 'No file body provided.'
    };

    onLogActivity(`Created new note: "${createdDoc.name}" in ${createdDoc.folder}`);
    setDocuments((prev) => [createdDoc, ...prev]);

    setNewDoc({
      name: '',
      folder: 'Hardware & Schematics',
      category: 'Schematics',
      author: '',
      tags: '',
      content: ''
    });
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
        <aside className="md:col-span-4 lg:col-span-3 hub-panel border border-zinc-800/90 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between px-2 py-1 text-zinc-400 font-mono text-xs uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Folders</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Files"
                className="md:hidden p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowNewFolderInput((prev) => !prev)}
                title="New Folder"
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showNewFolderInput && (
            <form onSubmit={handleCreateFolder} className="px-1 flex items-center gap-1.5">
              <input
                ref={folderInputRef}
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="flex-1 min-w-0 h-8 bg-zinc-950 border border-zinc-700 rounded-md px-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
              />
              <button
                type="submit"
                title="Save Folder"
                className="h-8 w-8 flex items-center justify-center bg-zinc-100 text-zinc-950 hover:bg-white rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                title="Cancel"
                className="h-8 w-8 flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto pb-1 md:pb-0">
            {folders.map((folder) => {
              const isActive = !isGlobalFiltering && selectedFolder === folder;
              const count = getFolderCount(folder);
              const isCustom =
                folder !== 'ALL' && !DEFAULT_FOLDERS.includes(folder);

              return (
                <div
                  key={folder}
                  onClick={() => {
                    setSelectedFolder(folder);
                    setSelectedTag(null);
                  }}
                  className={`group shrink-0 md:shrink md:w-full flex items-center justify-between gap-2 px-2.5 py-1.5 md:py-2 rounded-lg text-xs transition-colors cursor-pointer text-left border ${
                    isActive
                      ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-100 font-medium'
                      : 'bg-zinc-950/60 md:bg-transparent border-zinc-800 md:border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isActive ? (
                      <FolderOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-200 shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-500 shrink-0" />
                    )}
                    <span className="truncate">
                      {folder === 'ALL' ? 'All Documents' : folder}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFolder(e, folder)}
                        title="Remove custom folder"
                        className="md:opacity-0 md:group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <span className="font-mono tabular-nums text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block pt-2 border-t border-zinc-800">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleManualFileInput}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-9 flex items-center justify-center gap-1.5 px-3 bg-zinc-950 hover:bg-zinc-900 border border-dashed border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Files</span>
            </button>
          </div>
        </aside>

        <section className="md:col-span-8 lg:col-span-9 space-y-4">
          <div className="hub-panel border border-zinc-800/90 p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across all folders by filename, tag, author, or text..."
                className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm font-mono"
              />
            </div>

            <button
              onClick={openCreateNoteModal}
              className="h-9 flex items-center justify-center gap-1.5 px-3.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Note</span>
            </button>
          </div>

          {(selectedTag || (searchTerm.trim() && selectedFolder !== 'ALL')) && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/60 text-amber-300">
                    <Hash className="w-3 h-3" />
                    <span>{selectedTag}</span>
                  </span>
                )}
                {searchTerm.trim() && selectedFolder !== 'ALL' && (
                  <span className="text-zinc-400">Showing matches across all folders</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchTerm('');
                }}
                className="text-zinc-400 hover:text-zinc-100 underline underline-offset-2 cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}

          <div
            key={`${isGlobalFiltering ? 'search' : selectedFolder}-${selectedTag || 'all'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border rounded-xl transition-colors hub-panel animate-filter-swap ${
              isDragOver
                ? 'border-dashed border-zinc-400 bg-zinc-900/90'
                : 'border-zinc-800/90'
            }`}
          >
            {isDragOver && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/95 rounded-xl pointer-events-none space-y-2 border-2 border-dashed border-zinc-500">
                <FileCheck2 className="w-7 h-7 text-zinc-200" />
                <span className="font-mono text-xs text-zinc-200 font-medium">
                  Drop files to save into [{selectedFolder === 'ALL' ? 'Operational Protocols' : selectedFolder}]
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Files will be added to the vault right away
                </span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
                    <th className="py-3.5 px-4">Document / File</th>
                    <th className="py-3.5 px-4">Folder & Tags</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4">Modified</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-zinc-500 font-mono text-xs">
                        No matching files found. Drop any files here from your computer to add them.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isPinned = pinnedDocIds.includes(doc.id);
                      return (
                        <tr
                          key={doc.id}
                          className={`transition-colors ${
                            isPinned ? 'bg-amber-950/15 hover:bg-amber-950/25' : 'hover:bg-zinc-900/50'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={(e) => togglePinDoc(e, doc)}
                                title={isPinned ? 'Unpin document' : 'Pin important document to top'}
                                className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                                  isPinned
                                    ? 'text-amber-400 hover:text-amber-300'
                                    : 'text-zinc-600 hover:text-zinc-300'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400' : ''}`} />
                              </button>
                              <FileCode className="w-4 h-4 text-zinc-400 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openDocumentInspector(doc, false)}
                                    className="font-medium text-zinc-100 hover:text-white hover:underline underline-offset-2 text-left cursor-pointer"
                                  >
                                    {doc.name}
                                  </button>
                                  {isPinned && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300 font-mono text-[9px] uppercase">
                                      Pinned
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500 font-mono">
                                  Author: {doc.author} · {doc.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-zinc-300 text-xs">{doc.folder}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doc.tags.map((tag) => {
                                const tagActive =
                                  selectedTag && selectedTag.toLowerCase() === tag.toLowerCase();
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={(e) => handleTagClick(e, tag)}
                                    title={`Filter by #${tag}`}
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                                      tagActive
                                        ? 'bg-amber-950/60 border-amber-700 text-amber-200'
                                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                  >
                                    #{tag}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-zinc-400 font-mono tabular-nums text-xs whitespace-nowrap">
                            {doc.size}
                          </td>

                          <td className="py-3.5 px-4 text-zinc-400 font-mono tabular-nums text-xs whitespace-nowrap">
                            {doc.updatedAt}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => openDocumentInspector(doc, false)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                                title="Read Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDocumentInspector(doc, true)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                                title="Edit Document"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-backdrop-in">
          <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-modal-in">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-900/50">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={(e) => togglePinDoc(e, selectedDoc)}
                  title={
                    pinnedDocIds.includes(selectedDoc.id)
                      ? 'Unpin document'
                      : 'Pin important document to top'
                  }
                  className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                    pinnedDocIds.includes(selectedDoc.id)
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      pinnedDocIds.includes(selectedDoc.id) ? 'fill-amber-400' : ''
                    }`}
                  />
                </button>
                <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                <h3 className="text-sm font-semibold text-zinc-100 truncate">
                  {isEditingDoc ? `Editing: ${selectedDoc.name}` : selectedDoc.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isEditingDoc && (
                  <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-md p-0.5 text-[11px] font-mono">
                    <button
                      onClick={() => setPreviewMode('formatted')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        previewMode === 'formatted'
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Formatted</span>
                    </button>
                    <button
                      onClick={() => setPreviewMode('raw')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        previewMode === 'raw'
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Code2 className="w-3 h-3" />
                      <span>Raw</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (isEditingDoc) {
                      setIsEditingDoc(false);
                    } else {
                      openDocumentInspector(selectedDoc, true);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    isEditingDoc
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingDoc ? 'Cancel Edit' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setIsEditingDoc(false);
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isEditingDoc ? (
              <form
                id="edit-doc-form"
                onSubmit={handleSaveDocEdits}
                className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-mono text-[11px]">FILENAME *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-mono text-[11px]">FOLDER</label>
                    <select
                      value={editForm.folder}
                      onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                    >
                      {directoryList.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-mono text-[11px]">TAGS (COMMA-SEPARATED)</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="space-y-1 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 font-mono text-[11px]">
                      DOCUMENT CONTENT
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Supports # headings, - lists, **bold**, `code`
                    </span>
                  </div>
                  <textarea
                    rows="11"
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-zinc-500 resize-y"
                  />
                </div>
              </form>
            ) : (
              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/80 font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">DOCUMENT ID</span>
                    <span className="text-zinc-300">{selectedDoc.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">FOLDER</span>
                    <span className="text-zinc-300 truncate block">{selectedDoc.folder}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">AUTHOR</span>
                    <span className="text-zinc-300 truncate block">{selectedDoc.author}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">UPDATED</span>
                    <span className="text-zinc-300 tabular-nums">{selectedDoc.updatedAt}</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  {previewMode === 'formatted' ? (
                    <MarkdownPreview content={selectedDoc.content} />
                  ) : (
                    <pre className="text-zinc-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {selectedDoc.content}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDeleteDocument(selectedDoc)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-300 rounded-md text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete File</span>
              </button>

              <div className="flex items-center gap-2">
                {isEditingDoc ? (
                  <button
                    type="submit"
                    form="edit-doc-form"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedDoc)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-backdrop-in">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4 animate-modal-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-zinc-100">Create New Note</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="text-zinc-300">File Name *</label>
                <input
                  type="text"
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Sensor-Setup-Checklist.md"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300">Folder</label>
                  <select
                    value={newDoc.folder}
                    onChange={(e) => setNewDoc({ ...newDoc, folder: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                  >
                    {directoryList.map((folder) => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300">Author *</label>
                  <input
                    type="text"
                    required
                    value={newDoc.author}
                    onChange={(e) => setNewDoc({ ...newDoc, author: e.target.value })}
                    placeholder="Your name..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newDoc.tags}
                  onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                  placeholder="e.g. Sensor, Lab, Guide"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300">Note Content (Markdown supported)</label>
                <textarea
                  rows="5"
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  placeholder="# Title&#10;- Step 1&#10;- Step 2"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-500 resize-none"
                ></textarea>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:bg-zinc-900 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.title}
        message={pendingConfirm?.message}
        confirmLabel={pendingConfirm?.confirmLabel}
        tone={pendingConfirm?.tone || 'danger'}
        onConfirm={() => pendingConfirm?.onConfirm()}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
