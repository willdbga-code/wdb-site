"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, HardDrive, ArrowLeft, CheckSquare, Eye, ExternalLink, RefreshCw, X } from "lucide-react";
import Link from "next/link";

interface StorageItem {
  id: string;
  url: string;
  rawUrl: string;
  downloadUrl?: string;
  pathname: string;
  filename: string;
  folder: string;
  sizeBytes: number;
  sizeFormatted: string;
  uploadedAt: string;
}

export default function AdminStorage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [totalFormatted, setTotalFormatted] = useState("0 Bytes");
  const [loading, setLoading] = useState(true);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [previewImage, setPreviewImage] = useState<StorageItem | null>(null);

  const fetchStorage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      if (data.blobs) {
        setItems(data.blobs);
        setTotalFormatted(data.totalFormatted || "0 Bytes");
      }
    } catch (err) {
      console.error("Erro ao carregar armazenamento:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  const categories = ["Todos", ...Array.from(new Set(items.map((i) => i.folder)))];

  const filteredItems = items.filter((item) => {
    if (activeCategory === "Todos") return true;
    return item.folder === activeCategory;
  });

  const toggleSelect = (rawUrl: string) => {
    setSelectedUrls((prev) =>
      prev.includes(rawUrl) ? prev.filter((x) => x !== rawUrl) : [...prev, rawUrl]
    );
  };

  const toggleSelectAll = () => {
    const allFilteredUrls = filteredItems.map((i) => i.rawUrl);
    const allSelected = allFilteredUrls.every((url) => selectedUrls.includes(url));
    if (allSelected) {
      setSelectedUrls((prev) => prev.filter((url) => !allFilteredUrls.includes(url)));
    } else {
      setSelectedUrls((prev) => Array.from(new Set([...prev, ...allFilteredUrls])));
    }
  };

  const handleDeleteSingle = async (item: StorageItem) => {
    if (!confirm(`Deseja realmente apagar o arquivo "${item.filename}" permanentemente?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [item.rawUrl] }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.rawUrl !== item.rawUrl));
        setSelectedUrls((prev) => prev.filter((u) => u !== item.rawUrl));
      } else {
        alert("Erro ao excluir arquivo.");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      !confirm(
        `Tem certeza que deseja apagar ${selectedUrls.length} arquivos permanentemente do Vercel Blob?`
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedUrls }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => !selectedUrls.includes(i.rawUrl)));
        setSelectedUrls([]);
      } else {
        alert("Erro ao excluir arquivos selecionados.");
      }
    } catch (err) {
      console.error("Erro geral na exclusão:", err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 md:p-16 pb-32">
      <Link
        href="/admin"
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Resumo
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Central de Armazenamento</h1>
          <p className="text-gray-400 font-light text-sm tracking-wide">
            Controle total de todas as imagens e mídias salvas no Vercel Blob.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchStorage}
            disabled={loading}
            className="p-3 bg-surface hover:bg-white/10 border border-border text-gray-400 hover:text-white transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
          {!loading && (
            <div className="flex items-center gap-3 text-primary font-serif italic text-lg border border-primary/50 bg-primary/5 px-5 py-2.5">
              <HardDrive className="w-5 h-5 text-primary" />
              <span>
                {items.length} {items.length === 1 ? "Arquivo" : "Arquivos"} • {totalFormatted}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-mono tracking-widest uppercase transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-black font-semibold"
                  : "bg-surface border border-border text-gray-400 hover:text-white"
              }`}
            >
              {cat} (
              {cat === "Todos" ? items.length : items.filter((i) => i.folder === cat).length})
            </button>
          ))}
        </div>

        {filteredItems.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="text-[11px] uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4 text-primary" />
            {filteredItems.every((i) => selectedUrls.includes(i.rawUrl))
              ? "Desmarcar Todos"
              : "Selecionar Todos"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Consultando Vercel Blob Storage...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center text-gray-500 text-xs tracking-widest uppercase border border-border border-dashed">
          Nenhum arquivo encontrado nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedUrls.includes(item.rawUrl);
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.filename);

            return (
              <div
                key={item.id}
                className={`group relative bg-surface border overflow-hidden flex flex-col justify-between transition-all ${
                  isSelected ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-gray-600"
                }`}
              >
                {/* Checkbox Selector */}
                <button
                  onClick={() => toggleSelect(item.rawUrl)}
                  className={`absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary text-black"
                      : "bg-black/70 text-white/50 border border-white/30 hover:border-white"
                  }`}
                >
                  {isSelected && <CheckSquare className="w-4 h-4 text-black" />}
                </button>

                {/* Single Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSingle(item);
                  }}
                  disabled={deleting}
                  title="Apagar este arquivo"
                  className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Media Image / Icon Preview */}
                <div
                  onClick={() => isImage && setPreviewImage(item)}
                  className="relative aspect-square w-full bg-black/40 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isSelected ? "scale-105 opacity-100" : "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                      }`}
                    />
                  ) : (
                    <span className="text-gray-500 font-mono text-xs uppercase tracking-widest text-center p-4">
                      {item.filename}
                    </span>
                  )}

                  {isImage && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <Eye className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="p-3 bg-[#0a0a0a] border-t border-border flex flex-col gap-1 text-[11px]">
                  <p className="font-mono text-white truncate font-medium" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-gray-500 text-[10px]">
                    <span className="text-primary truncate">{item.folder}</span>
                    <span>{item.sizeFormatted}</span>
                  </div>
                  <span className="text-gray-600 text-[9px]">
                    {new Date(item.uploadedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] bg-surface border border-border overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-white">{previewImage.filename}</p>
                <span className="text-xs text-primary">{previewImage.folder} • {previewImage.sizeFormatted}</span>
              </div>
              <button
                onClick={() => handleDeleteSingle(previewImage)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 text-xs uppercase tracking-widest"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/80 max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.filename}
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Batch Action Bar */}
      {selectedUrls.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-md border border-border px-8 py-4 flex items-center gap-8 shadow-2xl z-50 rounded-lg">
          <span className="text-sm font-serif italic text-primary">
            {selectedUrls.length} {selectedUrls.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}
          </span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="bg-red-600/90 hover:bg-red-500 text-white px-6 py-2.5 text-xs uppercase tracking-widest font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {deleting ? "Excluindo..." : "Excluir Lote"}
          </button>
        </div>
      )}
    </div>
  );
}
