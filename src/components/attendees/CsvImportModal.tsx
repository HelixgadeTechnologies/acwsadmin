'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Attendee } from '@/types';

export default function CsvImportModal({
  isOpen,
  onClose,
  onImportComplete
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row.');
    }

    const headerLine = lines[0];
    const delimiter = headerLine.includes('\t') ? '\t' : (headerLine.includes(';') ? ';' : ',');
    const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('guest') || h.includes('attendee'));
    const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
    const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel') || h.includes('mobile'));
    const ticketIdx = headers.findIndex(h => h.includes('ticket') || h.includes('tier') || h.includes('type'));
    const partnerIdx = headers.findIndex(h => h.includes('partner') || h.includes('spouse'));

    if (nameIdx === -1 && emailIdx === -1) {
      throw new Error('CSV must contain at least a "Name" or "Email" column.');
    }

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length === 0 || parts.every(p => !p)) continue;

      const fullName = (nameIdx !== -1 ? parts[nameIdx] : '') || parts[0] || 'Guest';
      const email = (emailIdx !== -1 ? parts[emailIdx] : '') || `guest${i}@example.com`;
      const phone = phoneIdx !== -1 ? parts[phoneIdx] : '';
      const rawTicket = ticketIdx !== -1 ? parts[ticketIdx].toLowerCase() : 'standard';
      const partnerName = partnerIdx !== -1 ? parts[partnerIdx] : '';

      let ticketType: Attendee['ticketType'] = 'standard';
      if (rawTicket.includes('vip')) ticketType = 'vip';
      else if (rawTicket.includes('catwalk') || rawTicket.includes('exclusive')) ticketType = 'catwalk-exclusive';

      rows.push({
        fullName,
        email,
        phone,
        partnerName,
        ticketType,
        pricePaid: ticketType === 'catwalk-exclusive' ? 85 : (ticketType === 'vip' ? 65 : 25),
        paymentStatus: 'paid' as const,
        fastTrackPass: ticketType !== 'standard'
      });
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processSelectedFile(selected);
  };

  const processSelectedFile = (selected: File) => {
    setError(null);
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = parseCsvText(text);
        setPreviewData(parsed);
      } catch (err: any) {
        setError(err.message || 'Failed to read CSV.');
        setPreviewData([]);
      }
    };
    reader.onerror = () => setError('Error reading file from disk.');
    reader.readAsText(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteImport = async () => {
    if (previewData.length === 0) return;
    setIsProcessing(true);
    try {
      const { ApiService } = await import('@/lib/api');
      const importedCount = await ApiService.importAttendees(previewData);
      onImportComplete(importedCount);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Import failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-[#E0E5F2] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E0E5F2] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9E6] text-[#B58E29] border border-[#F3DC82] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B254B]">Import Attendees from CSV</h3>
              <p className="text-xs text-[#A3AED0]">Bulk register tickets, guest lists, and VIP passes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#707EAE] hover:text-[#1B254B] bg-[#F4F7FE] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E0E5F2] hover:border-[#D4AF37] rounded-2xl p-8 text-center cursor-pointer bg-[#F4F7FE] transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,text/csv"
              className="hidden"
            />
            <FileText className="w-8 h-8 text-[#B58E29] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1B254B]">Click to browse or drag and drop your CSV file</p>
            <p className="text-xs text-[#A3AED0] mt-1">Accepts standard .csv format with Full Name, Email, Ticket Type columns</p>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#1B254B]">
                  Preview ({previewData.length} records ready to import)
                </span>
                <span className="text-[11px] text-[#10B981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Validated
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-[#E0E5F2] rounded-xl bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F7FE] border-b border-[#E0E5F2] text-[#707EAE]">
                    <tr>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Partner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E5F2]">
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="text-[#1B254B]">
                        <td className="py-2.5 px-3 font-semibold">{row.fullName}</td>
                        <td className="py-2.5 px-3 text-[#707EAE]">{row.email}</td>
                        <td className="py-2.5 px-3 capitalize">
                          <span className="px-2 py-0.5 rounded bg-[#F4F7FE] text-[10px] font-semibold">
                            {row.ticketType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#A3AED0]">{row.partnerName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E0E5F2] bg-[#F4F7FE] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#707EAE] hover:text-[#1B254B] cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={previewData.length === 0 || isProcessing}
            onClick={handleExecuteImport}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#B58E29] text-[#070506] font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-40"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-[#070506] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Execute Batch Import ({previewData.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
