import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Printer, Download, FileSpreadsheet, FileText, X, Eye, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export interface ReportColumn {
  header: string;
  accessorKey: string | ((row: any) => any);
  align?: 'left' | 'center' | 'right';
  isCurrency?: boolean;
}

export interface EnterpriseReportViewerProps {
  title: string;
  reportPeriod?: string;
  columns: ReportColumn[];
  data: any[];
  summaryRow?: Record<string, string | number>;
  remarks?: string;
  orientation?: 'portrait' | 'landscape';
  triggerText?: string;
}

export const EnterpriseReportViewer: React.FC<EnterpriseReportViewerProps> = ({
  title,
  reportPeriod = 'Current Period',
  columns,
  data,
  summaryRow,
  remarks,
  orientation = 'portrait',
  triggerText = 'Preview & Export Report',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const formattedDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const societyName = (user as any)?.societyName || 'NestSphere Enterprise Housing Society';
  const societyCode = 'NS-SOCIETY-001';
  const generatedBy = (user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}` : 'Society Admin';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = data.map((row) =>
      columns
        .map((col) => {
          const val = typeof col.accessorKey === 'function' ? col.accessorKey(row) : row[col.accessorKey];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button variant="outline" className="gap-2 font-medium" onClick={() => setIsOpen(true)}>
        <Eye className="w-4 h-4 text-primary" />
        {triggerText}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-background border border-border/60 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Control Bar (Non-Printable) */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-display font-bold text-lg">{title} — Report Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5">
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" /> Export CSV
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Printable Corporate Report Document */}
            <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans space-y-6 print:p-0 print:text-black">
              {/* Corporate Header */}
              <div className="border-b-2 border-slate-900 pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl print:border">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">{societyName}</h1>
                      <p className="text-xs text-slate-600">Reg. No: REG/HSG/MUM/2026/89402 | GST: 24AAAAA0000A1Z5</p>
                      <p className="text-xs text-slate-600">Ahmedabad, Gujarat | Contact: +91 98765 43210</p>
                    </div>
                  </div>
                  <div className="text-right text-xs space-y-0.5 text-slate-700">
                    <p className="font-bold text-slate-900 uppercase">REPORT CODE: {societyCode}</p>
                    <p>Period: <span className="font-medium">{reportPeriod}</span></p>
                    <p>Generated: <span className="font-medium">{formattedDate}</span></p>
                    <p>Generated By: <span className="font-medium">{generatedBy}</span></p>
                  </div>
                </div>
              </div>

              {/* Report Title Badge */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex justify-between items-center print:bg-white print:border-slate-900">
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">{title}</h2>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded print:border">
                  Official Record
                </span>
              </div>

              {/* Data Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800 text-white uppercase text-[11px] font-bold tracking-wider print:bg-slate-900">
                    <tr>
                      <th className="p-2.5 border-b border-slate-700 w-12 text-center">#</th>
                      {columns.map((col, idx) => (
                        <th
                          key={idx}
                          className={`p-2.5 border-b border-slate-700 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="p-4 text-center text-slate-500 italic">
                          No records found for this report period.
                        </td>
                      </tr>
                    ) : (
                      data.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="p-2.5 text-center text-slate-500 font-mono font-medium">{rowIdx + 1}</td>
                          {columns.map((col, colIdx) => {
                            const rawVal =
                              typeof col.accessorKey === 'function' ? col.accessorKey(row) : row[col.accessorKey];
                            return (
                              <td
                                key={colIdx}
                                className={`p-2.5 ${
                                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                                }`}
                              >
                                {col.isCurrency && typeof rawVal === 'number'
                                  ? `₹${rawVal.toLocaleString('en-IN')}`
                                  : rawVal ?? '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                  {summaryRow && (
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 print:bg-white">
                      <tr>
                        <td className="p-2.5 text-center text-slate-900 uppercase">Total</td>
                        {columns.map((col, colIdx) => {
                          const key = typeof col.accessorKey === 'string' ? col.accessorKey : `col_${colIdx}`;
                          const val = summaryRow[key];
                          return (
                            <td
                              key={colIdx}
                              className={`p-2.5 ${
                                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                              }`}
                            >
                              {val ?? ''}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Remarks & Signatures */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Remarks / Declarations:</p>
                  <p className="text-slate-500 max-w-md italic">
                    {remarks || 'This report is system-generated by NestSphere ERP v1.0.1 and constitutes an official society document.'}
                  </p>
                </div>
                <div className="text-center space-y-8 pr-4">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">Authorized Signature</p>
                  <div className="border-b border-slate-900 w-36 mx-auto" />
                  <p className="font-bold text-slate-900 text-xs">Society Secretary / Accountant</p>
                </div>
              </div>

              {/* Corporate Footer */}
              <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                <p>Confidential & Proprietary — Generated by NestSphere ERP v1.0.1</p>
                <p className="font-mono">Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
