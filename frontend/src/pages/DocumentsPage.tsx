import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import { documentApi, Document, DocumentFolder, DocumentMetrics } from '../api/document.api';
import {
  FileText,
  FolderPlus,
  UploadCloud,
  Trash2,
  RotateCcw,
  Search,
  HardDrive,
  Clock,
  Shield,
  FileCheck,
  Plus,
  Download,
  X,
  History,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [metrics, setMetrics] = useState<DocumentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [viewRecycleBin, setViewRecycleBin] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Document Form
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('GENERAL');
  const [entityType, setEntityType] = useState('SOCIETY');
  const [extension, setExtension] = useState('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [sizeBytes, setSizeBytes] = useState(1048576); // 1 MB
  const [storageProvider, setStorageProvider] = useState('LOCAL');

  // Folder Form
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedEntityType, viewRecycleBin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, folderRes, metRes] = await Promise.all([
        documentApi.getDocuments({
          search,
          category: selectedCategory || undefined,
          entityType: selectedEntityType || undefined,
          isDeleted: viewRecycleBin,
        }),
        documentApi.getFolders(),
        documentApi.getMetrics(),
      ]);
      setDocuments(docsRes.data || []);
      setFolders(folderRes || []);
      setMetrics(metRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await documentApi.createDocument({
        title: docTitle,
        description: docDescription,
        category: docCategory,
        entityType,
        mimeType: extension === 'pdf' ? 'application/pdf' : 'image/png',
        extension,
        sizeBytes: Number(sizeBytes),
        fileUrl: fileUrl || `https://storage.societyerp.io/docs/${Date.now()}.${extension}`,
        storageProvider,
      });
      setIsUploadModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await documentApi.createFolder(folderName);
      setIsFolderModalOpen(false);
      setFolderName('');
      fetchData();
    } catch {
      alert('Failed to create folder');
    }
  };

  const handleRecycle = async (id: string) => {
    try {
      await documentApi.moveToRecycleBin(id);
      fetchData();
    } catch {
      alert('Failed to move document to Recycle Bin');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await documentApi.restoreFromRecycleBin(id);
      fetchData();
    } catch {
      alert('Failed to restore document');
    }
  };

  const resetForm = () => {
    setDocTitle('');
    setDocDescription('');
    setFileUrl('');
    setSizeBytes(1048576);
  };

  const categories = ['KYC', 'AGREEMENT', 'MANUAL', 'INVOICE', 'BLUEPRINT', 'NOC', 'COMPLIANCE', 'GENERAL'];
  const targetEntities = [
    'PERSON',
    'VISITOR',
    'PROPERTY',
    'ASSET',
    'WORKFLOW',
    'COMPLAINT',
    'VENDOR',
    'STAFF',
    'BILLING',
    'INVOICE',
    'PAYMENT',
    'MEETING',
    'SOCIETY',
  ];

  const columns = [
    {
      header: 'Document Name & Code',
      accessorKey: (row: Document) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0 font-mono">
            {row.extension.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">{row.title}</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Code: {row.documentCode} | v{row.version}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Module Entity & Category',
      accessorKey: (row: Document) => (
        <div className="text-xs space-y-0.5">
          <Badge variant="outline" className="text-[10px]">
            {row.category}
          </Badge>
          <p className="text-muted-foreground">Entity: {row.entityType || 'General'}</p>
        </div>
      ),
    },
    {
      header: 'File Size & Provider',
      accessorKey: (row: Document) => (
        <div className="text-xs font-mono">
          <p className="font-medium text-foreground">{(row.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
          <Badge variant="secondary" className="text-[9px] uppercase font-mono">
            {row.storageProvider}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Uploaded Date',
      accessorKey: (row: Document) => (
        <div className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Action',
      accessorKey: (row: Document) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedDoc(row)}
            className="h-8 px-2 text-xs rounded-lg"
          >
            Versions & Audit
          </Button>

          {row.isDeleted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRestore(row.id)}
              className="h-8 px-2 text-xs text-emerald-500 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRecycle(row.id)}
              className="h-8 px-2 text-xs text-destructive rounded-lg hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Enterprise Document & File Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Universal file vault supporting 12 target entities (Assets, People, Workflows, Invoices, KYC)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsFolderModalOpen(true)} className="rounded-xl">
            <FolderPlus className="h-4 w-4 mr-2" /> New Folder
          </Button>
          <Button onClick={() => setIsUploadModalOpen(true)} className="rounded-xl">
            <UploadCloud className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Document Catalog" value={metrics?.totalDocuments || 0} description="Universal Storage Vault" icon={FileText} />
        <StatCard title="Total Vault Storage" value={`${metrics?.totalSizeMB || 0} MB`} description="Multi-Provider Storage" icon={HardDrive} />
        <StatCard title="Target Module Integrations" value="12 Modules" description="People, Assets, Invoices, NOC" icon={Shield} />
        <StatCard title="Expiring Reminders" value={`${metrics?.expiringCount || 0} Files`} description="30-Day Expiry Warnings" icon={Clock} />
      </div>

      {/* Folders Bar */}
      {folders.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {folders.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 bg-card hover:bg-accent/40 text-xs font-semibold shrink-0 cursor-pointer transition-all"
            >
              <FolderPlus className="h-4 w-4 text-primary" />
              <span>{f.name}</span>
              <Badge variant="secondary" className="text-[10px] ml-1">{f._count?.documents || 0}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Document Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Target Modules (12 Modules)</option>
              {targetEntities.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <Button
              variant={viewRecycleBin ? 'destructive' : 'outline'}
              onClick={() => setViewRecycleBin(!viewRecycleBin)}
              className="rounded-xl text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> {viewRecycleBin ? 'Exit Recycle Bin' : 'Recycle Bin'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSpinner message="Querying document platform vault..." />
      ) : (
        <DataTable columns={columns} data={documents} emptyMessage="No documents found in vault." />
      )}

      {/* Modal: Upload Document */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Upload Document to Vault</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Document Title *</label>
                <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. Structural Blueprint Tower A" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Target Module Entity</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    {targetEntities.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">File Format Extension</label>
                  <select
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="png">PNG Image</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="xlsx">Excel Sheet (.xlsx)</option>
                    <option value="dwg">CAD File (.dwg)</option>
                    <option value="zip">ZIP Archive (.zip)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Storage Provider</label>
                  <select
                    value={storageProvider}
                    onChange={(e) => setStorageProvider(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                  >
                    <option value="LOCAL">Local Server Storage</option>
                    <option value="AWS_S3">Amazon Web Services (S3)</option>
                    <option value="MINIO">MinIO Private Cloud</option>
                    <option value="AZURE_BLOB">Azure Blob Storage</option>
                    <option value="GOOGLE_CLOUD_STORAGE">Google Cloud Storage</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">File URL Payload</label>
                <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://storage.societyerp.io/docs/blueprint.pdf" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Register Document & Create Version 1
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Folder */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Create Folder</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsFolderModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Folder Name *</label>
                <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="e.g. Financial Invoices 2026" required />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsFolderModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Create Folder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Document Version History */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Document Version Audit</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDoc(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1 text-xs">
              <h4 className="font-bold text-base">{selectedDoc.title}</h4>
              <p className="text-muted-foreground font-mono">Code: {selectedDoc.documentCode} | Current Version: v{selectedDoc.version}</p>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              <p className="font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <History className="h-3.5 w-3.5 text-primary" /> Version History Stack
              </p>
              {selectedDoc.versions?.map((v) => (
                <div key={v.id} className="p-3 rounded-xl border border-border/40 bg-accent/20 flex justify-between items-center">
                  <div>
                    <span className="font-bold">v{v.version}</span>
                    <p className="text-muted-foreground text-[10px]">{v.changeNotes || 'Document Revision'}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px]">
                    {(v.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedDoc(null)} className="rounded-xl">
                Close Audit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
