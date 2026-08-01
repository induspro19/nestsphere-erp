import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Plus, Eye, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentDocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState([
    { id: 'd1', title: 'Share Certificate', category: 'LEGAL', size: '1.2 MB', date: '2026-01-15' },
    { id: 'd2', title: 'Flat Ownership Agreement', category: 'AGREEMENT', size: '2.5 MB', date: '2026-02-10' },
    { id: 'd3', title: 'Society Bye-Laws 2026', category: 'RULES', size: '850 KB', date: '2026-04-01' },
    { id: 'd4', title: 'Maintenance Receipt - June 2026', category: 'RECEIPT', size: '320 KB', date: '2026-06-30' },
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'PERSONAL' });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;

    const uploaded = {
      id: `d_${Date.now()}`,
      title: newDoc.title,
      category: newDoc.category,
      size: '1.4 MB',
      date: new Date().toISOString().split('T')[0],
    };

    setDocs([uploaded, ...docs]);
    toast.success(`Document "${newDoc.title}" uploaded to your personal vault.`);
    setNewDoc({ title: '', category: 'PERSONAL' });
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> My Documents & Vault
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Share certificates, agreements, maintenance bills, receipts, and circulars</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} size="sm" className="gap-1.5 text-xs shadow-md">
          <Upload className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <div key={doc.id} className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/40 transition-all flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{doc.title}</h4>
                <p className="text-xs text-muted-foreground">{doc.category} • {doc.size} • {doc.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${doc.title}`)} className="gap-1 text-xs">
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success(`Downloading ${doc.title}...`)} className="gap-1 text-xs">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="font-bold text-lg font-display">Upload Document to Vault</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowUploadModal(false)} className="h-8 w-8 p-0 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Document Title *</label>
                <Input
                  placeholder="e.g. Identity Proof / Rent Agreement"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground">Document Category</label>
                <select
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs"
                >
                  <option value="PERSONAL">Personal Document</option>
                  <option value="IDENTITY">Identity Proof (Aadhaar/PAN)</option>
                  <option value="AGREEMENT">Lease / Rent Agreement</option>
                  <option value="RECEIPT">Payment Receipt</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground">Select File</label>
                <Input type="file" required />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/20">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5">
                  <Upload className="h-4 w-4" /> Upload
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
