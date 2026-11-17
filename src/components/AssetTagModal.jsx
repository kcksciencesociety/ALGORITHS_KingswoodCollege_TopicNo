import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  QrCode,
  ScanLine,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Wrench,
  MapPin,
  Search
} from 'lucide-react';

function buildQrMatrix(seedText) {
  const size = 21;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (rowOffset, colOffset) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6);
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rr][cc] = inOuter || inInner;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      hash ^= (r * 31 + c * 17 + seedText.length);
      hash = Math.imul(hash, 16777619);
      grid[r][c] = ((hash >>> 0) % 100) < 48;
    }
  }

  return grid;
}

export function AssetLabelModal({ item, onClose }) {
  if (!item) return null;

  const matrix = buildQrMatrix(item.id);
  const size = matrix.length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 340;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    ctx.fillStyle = '#18181b';
    ctx.fillRect(12, 12, width - 24, 46);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('ECOSPARK INNOVATIONS · ASSET TAG', 28, 41);

    const qrStartX = 32;
    const qrStartY = 82;
    const cell = 9;

    ctx.fillStyle = '#18181b';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(qrStartX + c * cell, qrStartY + r * cell, cell, cell);
        }
      }
    }

    const textX = 248;
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('ASSET ID', textX, 98);

    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(item.id, textX, 130);

    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 17px sans-serif';
    const shortName = item.name.length > 34 ? `${item.name.slice(0, 34)}...` : item.name;
    ctx.fillText(shortName, textX, 168);

    ctx.fillStyle = '#52525b';
    ctx.font = '14px monospace';
    ctx.fillText(`Category: ${item.category}`, textX, 200);
    ctx.fillText(`Home: ${item.location}`, textX, 226);

    ctx.fillStyle = '#18181b';
    for (let i = 0; i < 42; i++) {
      const barWidth = (item.id.charCodeAt(i % item.id.length) + i) % 3 === 0 ? 4 : 2;
      ctx.fillRect(textX + i * 8, 252, barWidth, 34);
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.id}-sticker.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-asset-sticker, #printable-asset-sticker * {
            visibility: visible !important;
          }
          #printable-asset-sticker {
            position: fixed !important;
            left: 24px !important;
            top: 24px !important;
            width: 440px !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Printable Equipment Sticker</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-5 flex justify-center">
          <div
            id="printable-asset-sticker"
            className="w-full max-w-md bg-white text-zinc-950 rounded-md border-2 border-zinc-900 overflow-hidden shadow-lg"
          >
            <div className="bg-zinc-950 text-white px-3.5 py-2 flex items-center justify-between font-mono text-[11px] tracking-wider">
              <span className="font-bold">ECOSPARK INNOVATIONS</span>
              <span className="text-zinc-400">PROPERTY TAG</span>
            </div>

            <div className="p-4 flex items-center gap-4">
              <div className="shrink-0 p-1.5 bg-white border border-zinc-300 rounded">
                <svg
                  viewBox={`0 0 ${size} ${size}`}
                  className="w-28 h-28 block"
                  shapeRendering="crispEdges"
                >
                  <rect width={size} height={size} fill="#ffffff" />
                  {matrix.map((row, r) =>
                    row.map((filled, c) =>
                      filled ? (
                        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#09090b" />
                      ) : null
                    )
                  )}
                </svg>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Asset Tag
                  </span>
                  <div className="font-mono font-bold text-xl tracking-tight text-zinc-950">
                    {item.id}
                  </div>
                </div>

                <div className="text-xs font-semibold text-zinc-900 leading-snug line-clamp-2">
                  {item.name}
                </div>

                <div className="text-[11px] font-mono text-zinc-600 truncate">
                  {item.location}
                </div>

                <div className="pt-1 flex items-end gap-[2px] h-6" aria-hidden="true">
                  {Array.from({ length: 34 }).map((_, idx) => {
                    const code = item.id.charCodeAt(idx % item.id.length) + idx;
                    const wide = code % 3 === 0;
                    return (
                      <span
                        key={idx}
                        className={`bg-zinc-900 h-full inline-block ${wide ? 'w-[3px]' : 'w-[1.5px]'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          Stick this label on the equipment case or chassis so anyone can look up its status or check it out in seconds.
        </p>

        <div className="border-t border-zinc-800 pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Sticker PNG</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-white rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuickTagScannerModal({
  isOpen,
  onClose,
  inventory,
  onStartCheckout,
  onQuickReturn,
  onInspectHolder
}) {
  const [tagInput, setTagInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTagInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanCode = tagInput.trim().toLowerCase();
  const exactMatch = inventory.find((item) => item.id.toLowerCase() === cleanCode);
  const partialMatches =
    cleanCode && !exactMatch
      ? inventory.filter(
          (item) =>
            item.id.toLowerCase().includes(cleanCode) ||
            item.name.toLowerCase().includes(cleanCode)
        )
      : [];

  const matchedItem = exactMatch || (partialMatches.length === 1 ? partialMatches[0] : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden space-y-4 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Quick Tag Lookup</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400 block">
            Scan barcode or type an asset tag (e.g. <span className="font-mono text-zinc-200">ESP-AV-101</span>)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ESP-..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-mono text-sm uppercase"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-zinc-500 self-center mr-1">Test scan:</span>
            {inventory.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTagInput(item.id)}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
              >
                {item.id}
              </button>
            ))}
          </div>
        </div>

        {matchedItem ? (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                {matchedItem.id}
              </span>

              {matchedItem.status === 'Available' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Available
                </span>
              ) : matchedItem.status === 'Maintenance' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-950/50 text-rose-400 border border-rose-800/50">
                  <Wrench className="w-3.5 h-3.5" />
                  In Repair
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-800/50">
                  <Clock className="w-3.5 h-3.5" />
                  In Use
                </span>
              )}
            </div>

            <div>
              <div className="font-semibold text-sm text-zinc-100">{matchedItem.name}</div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{matchedItem.location}</span>
              </div>
              {matchedItem.status === 'In Use' && matchedItem.holder && (
                <div className="text-xs font-mono text-zinc-400 mt-1">
                  Currently with:{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onInspectHolder(matchedItem.holder);
                    }}
                    className="text-amber-300 underline underline-offset-2 cursor-pointer"
                  >
                    {matchedItem.holder}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end gap-2">
              {matchedItem.status === 'Available' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartCheckout(matchedItem);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-100 text-zinc-950 hover:bg-white rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>Check Out Gear</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}

              {matchedItem.status === 'In Use' && (
                <button
                  type="button"
                  onClick={() => {
                    onQuickReturn(matchedItem.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mark Returned</span>
                </button>
              )}

              {matchedItem.status === 'Maintenance' && (
                <div className="w-full text-center text-xs font-mono text-rose-400 py-1">
                  Out of service for repair. Clear in Gear Ledger first.
                </div>
              )}
            </div>
          </div>
        ) : cleanCode ? (
          <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 text-center text-xs font-mono text-zinc-500">
            {partialMatches.length > 1
              ? `${partialMatches.length} items match "${tagInput}". Type the full tag.`
              : `No equipment found matching "${tagInput}".`}
          </div>
        ) : null}
      </div>
    </div>
  );
}
