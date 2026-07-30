import React from 'react';
import { Button } from '../../components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentDocumentsPage: React.FC = () => {
  const docs = [
    { title: 'Share Certificate', category: 'LEGAL', size: '1.2 MB' },
    { title: 'Flat Ownership Agreement', category: 'AGREEMENT', size: '2.5 MB' },
    { title: 'Society Bye-Laws 2026', category: 'RULES', size: '850 KB' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> My Documents & Vault
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Share certificates, agreements, maintenance bills, receipts, and circulars</p>
      </div>

      <div className="space-y-3">
        {docs.map((doc, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold text-sm">{doc.title}</h4>
                <p className="text-xs text-muted-foreground">{doc.category} • {doc.size}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.success(`Downloading ${doc.title}...`)} className="gap-1 text-xs">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
