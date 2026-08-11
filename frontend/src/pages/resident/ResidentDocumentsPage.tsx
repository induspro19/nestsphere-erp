import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  FileText, 
  Download, 
  Plus, 
  Eye, 
  X, 
  Upload, 
  Search, 
  Bookmark, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Archive, 
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { documentApi, Document } from '../../api/document.api';
import { useAuthStore } from '../../store/authStore';

export const ResidentDocumentsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'BOOKMARKED'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'A_Z'>('NEWEST');

  // Interactive Document State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['doc-1', 'doc-3']);
  const [readIds, setReadIds] = useState<string[]>(['doc-2']);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  // Modals
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('PERSONAL');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [search, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentApi.getDocuments({
        search: search || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      });
      
      const items = res.data || res;
      if (Array.isArray(items) && items.length > 0) {
        setDocuments(items);
      } else {
        // Dynamic fallback documents if database is unpopulated
        setDocuments([
          {
            id: 'doc-1',
            documentCode: 'DOC-00001',
            title: 'Society Rules & Regulations 2026',
            description: 'Official society bye-laws, quiet hours, clubhouse guidelines, and community code of conduct.',
            category: 'RULES',
            mimeType: 'application/pdf',
            extension: 'pdf',
            sizeBytes: 1548576,
            storageProvider: 'LOCAL',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            version: 1,
            isPrivate: false,
            isDeleted: false,
            createdAt: '2026-08-01T10:00:00.000Z',
          },
          {
            id: 'doc-2',
            documentCode: 'DOC-00002',
            title: 'Emergency SOP & Fire Safety Manual',
            description: 'Fire extinguisher locations, emergency assembly points, and medical response contacts.',
            category: 'EMERGENCY_SOP',
            mimeType: 'application/pdf',
            extension: 'pdf',
            sizeBytes: 2450000,
            storageProvider: 'LOCAL',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            version: 2,
            isPrivate: false,
            isDeleted: false,
            createdAt: '2026-07-25T14:30:00.000Z',
          },
          {
            id: 'doc-3',
            documentCode: 'DOC-00003',
            title: 'Annual General Meeting (AGM) Minutes 2026',
            description: 'Approved minutes, financial audit report presentation, and committee resolution votes.',
            category: 'AGM_MINUTES',
            mimeType: 'application/pdf',
            extension: 'pdf',
            sizeBytes: 3100000,
            storageProvider: 'LOCAL',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            version: 1,
            isPrivate: false,
            isDeleted: false,
            createdAt: '2026-07-15T09:15:00.000Z',
          },
          {
            id: 'doc-4',
            documentCode: 'DOC-00004',
            title: 'EV Charging & Parking Slot Allocation Policy',
            description: 'Electric vehicle charger installation SOP, slot allocation guidelines, and visitor parking passes.',
            category: 'PARKING_POLICY',
            mimeType: 'application/pdf',
            extension: 'pdf',
            sizeBytes: 980000,
            storageProvider: 'LOCAL',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            version: 1,
            isPrivate: false,
            isDeleted: false,
            createdAt: '2026-07-10T16:20:00.000Z',
          },
          {
            id: 'doc-5',
            documentCode: 'DOC-00005',
            title: 'No Objection Certificate (NOC) Application Form',
            description: 'Standard NOC form for flat renovation, passport verification, or tenant move-in.',
            category: 'NOC_FORMS',
            mimeType: 'application/pdf',
            extension: 'pdf',
            sizeBytes: 520000,
            storageProvider: 'LOCAL',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            version: 1,
            isPrivate: false,
            isDeleted: false,
            createdAt: '2026-06-28T11:00:00.000Z',
          },
        ]);
      }
    } catch {
      toast.error('Failed to load live document vault');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewer = async (doc: Document) => {
    setViewingDoc(doc);
    if (!readIds.includes(doc.id)) {
      setReadIds((prev) => [...prev, doc.id]);
      try {
        await documentApi.markAsRead(doc.id);
      } catch {
        // Track silently
      }
    }
  };

  const handleDownload = async (doc: Document) => {
    if (!downloadedIds.includes(doc.id)) {
      setDownloadedIds((prev) => [...prev, doc.id]);
    }
    toast.success(`Downloading "${doc.title}"...`);
    try {
      await documentApi.trackDownload(doc.id);
    } catch {
      // Track download
    }

    // Direct browser download
    const a = window.document.createElement('a');
    a.href = doc.fileUrl;
    a.download = `${doc.documentCode}_${doc.title}.${doc.extension}`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds((prev) => prev.filter((i) => i !== id));
      toast.info('Removed from bookmarks');
    } else {
      setBookmarkedIds((prev) => [...prev, id]);
      toast.success('Added to bookmarks');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    try {
      const extension = uploadFile?.name.split('.').pop() || 'pdf';
      const sizeBytes = uploadFile?.size || 1048576;

      const created = await documentApi.createDocument({
        title: uploadTitle,
        category: uploadCategory,
        description: 'Uploaded to Resident Personal Vault',
        mimeType: uploadFile?.type || 'application/pdf',
        extension,
        sizeBytes,
        fileUrl: URL.createObjectURL(uploadFile || new Blob(['sample'])),
      });

      toast.success(`Document "${uploadTitle}" uploaded to your Vault!`);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  // Filter & Sort Logic
  const categories = [
    { id: 'ALL', label: 'All Documents' },
    { id: 'RULES', label: 'Rules & SOPs' },
    { id: 'EMERGENCY_SOP', label: 'Emergency SOPs' },
    { id: 'AGM_MINUTES', label: 'AGM Minutes' },
    { id: 'PARKING_POLICY', label: 'Parking & EV' },
    { id: 'NOC_FORMS', label: 'NOC & Forms' },
    { id: 'RECEIPT', label: 'Bills & Receipts' },
    { id: 'LEGAL', label: 'Agreements & Legal' },
  ];

  const filteredDocs = documents
    .filter((doc) => {
      // Category filter
      if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;

      // Status filter
      if (statusFilter === 'UNREAD' && readIds.includes(doc.id)) return false;
      if (statusFilter === 'READ' && !readIds.includes(doc.id)) return false;
      if (statusFilter === 'BOOKMARKED' && !bookmarkedIds.includes(doc.id)) return false;

      // Search filter
      if (search) {
        const query = search.toLowerCase();
        return (
          doc.title.toLowerCase().includes(query) ||
          (doc.description && doc.description.toLowerCase().includes(query)) ||
          doc.category.toLowerCase().includes(query) ||
          doc.documentCode.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.title.localeCompare(b.title);
    });

  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <ImageIcon className="h-5 w-5 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-full overflow-hidden">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight flex items-center gap-2 text-gray-900 truncate">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" /> <span className="truncate">Documents & Vault Center</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            Official society documents automatically distributed to Unit { (user as any)?.flatNumber || 'A-402' }
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)} 
          size="sm" 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shrink-0 whitespace-nowrap text-xs font-semibold px-3 sm:px-4 h-9"
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Upload Personal Document</span>
          <span className="sm:hidden">Upload Document</span>
        </Button>
      </div>

      {/* Search & Category Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, subject, category, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs h-10 rounded-xl border-gray-200 bg-gray-50/50"
            />
          </div>

          {/* Status & Sort Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNREAD">Unread (NEW)</option>
              <option value="READ">Read</option>
              <option value="BOOKMARKED">Bookmarked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 outline-none"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="A_Z">A - Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-100 pt-3">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Document Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-gray-500 p-4 col-span-full">Loading document vault...</p>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full p-10 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-semibold text-sm">No Documents Found</h3>
            <p className="text-gray-500 text-xs mt-1">No documents match your active search or category filters.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isRead = readIds.includes(doc.id);
            const isBookmarked = bookmarkedIds.includes(doc.id);
            const isDownloaded = downloadedIds.includes(doc.id);

            return (
              <div 
                key={doc.id} 
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between gap-4 relative group"
              >
                <div>
                  {/* Top Bar Badges */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                        {getFileIcon(doc.extension)}
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] font-semibold text-gray-600 border-gray-300">
                          {doc.category.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-mono text-gray-400 ml-1.5">v{doc.version}.0</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isRead && (
                        <Badge className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          NEW
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleBookmark(doc.id)}
                        className={`h-7 w-7 rounded-full ${isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-gray-300 hover:text-gray-500'}`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Footer Metadata & Actions */}
                <div className="border-t border-gray-100 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>{(doc.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenViewer(doc)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs h-9 rounded-xl border border-blue-200"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                    </Button>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(doc)}
                      className="flex-1 text-xs h-9 rounded-xl border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* IN-APP DOCUMENT VIEWER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`bg-white rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden transition-all ${
            isFullscreen ? 'h-full max-w-full rounded-none' : 'max-w-4xl max-h-[90vh]'
          }`}>
            
            {/* Viewer Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  {getFileIcon(viewingDoc.extension)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    {viewingDoc.title} <Badge variant="outline" className="text-[9px] border-white/30 text-white">v{viewingDoc.version}.0</Badge>
                  </h3>
                  <p className="text-[11px] text-gray-400">{viewingDoc.category.replace('_', ' ')} • {(viewingDoc.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleDownload(viewingDoc)} className="text-white hover:bg-white/10 h-8 text-xs gap-1">
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.print()} className="text-white hover:bg-white/10 h-8 text-xs gap-1">
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)} className="text-white hover:bg-white/10 h-8 w-8">
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setViewingDoc(null)} className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Viewer Main Frame */}
            <div className="flex-1 bg-gray-100 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
              {viewingDoc.extension.toLowerCase() === 'pdf' ? (
                <iframe
                  src={viewingDoc.fileUrl}
                  title={viewingDoc.title}
                  className="w-full h-full min-h-[500px] border-0 rounded-xl bg-white shadow-md"
                />
              ) : ['png', 'jpg', 'jpeg'].includes(viewingDoc.extension.toLowerCase()) ? (
                <img
                  src={viewingDoc.fileUrl}
                  alt={viewingDoc.title}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 max-w-md shadow-sm">
                  <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 text-base mb-1">{viewingDoc.title}</h4>
                  <p className="text-xs text-gray-500 mb-4">{viewingDoc.description || 'Enterprise Society Document'}</p>
                  <Button onClick={() => handleDownload(viewingDoc)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold rounded-xl">
                    <Download className="h-4 w-4" /> Download Original {viewingDoc.extension.toUpperCase()} File
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* UPLOAD PERSONAL VAULT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto sm:hidden mb-2" />
                <h3 className="font-bold text-base sm:text-lg font-display text-gray-900">Upload to Personal Vault</h3>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setShowUploadModal(false)} className="h-8 w-8 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Document Title *</label>
                <Input
                  placeholder="e.g. Identity Proof / Rent Agreement"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium outline-none"
                >
                  <option value="PERSONAL">Personal Document</option>
                  <option value="IDENTITY">Identity Proof (Aadhaar/PAN)</option>
                  <option value="AGREEMENT">Lease / Rent Agreement</option>
                  <option value="RECEIPT">Payment Receipt</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Select File *</label>
                <Input 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required 
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1 h-11 rounded-xl font-semibold">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2">
                  <Upload className="h-4 w-4" /> Upload File
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
