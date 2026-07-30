import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DataTable } from '../components/shared/DataTable';
import { StatCard } from '../components/shared/StatCard';
import {
  financialApi,
  FinancialTransaction,
  FinancialAccount,
  FinancialMetrics,
  AgingAnalysis,
} from '../api/financial.api';
import {
  DollarSign,
  Wallet,
  BookOpen,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  CreditCard,
  Building,
  TrendingUp,
  X,
  FileCheck,
} from 'lucide-react';

export const FinancialsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [aging, setAging] = useState<AgingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTxnType, setSelectedTxnType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'ACCOUNTS' | 'AGING'>('TRANSACTIONS');

  // Modals
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<FinancialTransaction | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  // Txn Form
  const [txnType, setTxnType] = useState('INVOICE');
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Journal Form
  const [narration, setNarration] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [journalAmount, setJournalAmount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [search, selectedTxnType, selectedStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txnsRes, accRes, metRes, agingRes] = await Promise.all([
        financialApi.getTransactions({
          search,
          txnType: selectedTxnType || undefined,
          status: selectedStatus || undefined,
        }),
        financialApi.getAccounts(),
        financialApi.getMetrics(),
        financialApi.getAgingAnalysis(),
      ]);
      setTransactions(txnsRes.data || []);
      setAccounts(accRes || []);
      setMetrics(metRes);
      setAging(agingRes);
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financialApi.createTransaction({
        txnType,
        subtotal: Number(subtotal),
        taxAmount: Number(taxAmount),
        penaltyAmount: Number(penaltyAmount),
        discountAmount: Number(discountAmount),
        paymentMethod,
      });
      setIsTxnModalOpen(false);
      resetTxnForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record transaction');
    }
  };

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitAccountId || !creditAccountId) return alert('Select both Debit & Credit accounts');
    try {
      await financialApi.createJournalEntry({
        narration,
        items: [
          { accountId: debitAccountId, debitAmount: Number(journalAmount), creditAmount: 0 },
          { accountId: creditAccountId, debitAmount: 0, creditAmount: Number(journalAmount) },
        ],
      });
      setIsJournalModalOpen(false);
      setNarration('');
      setJournalAmount(0);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Double entry journal failed');
    }
  };

  const handlePayTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    try {
      await financialApi.payTransaction(selectedTxn.id, {
        amount: Number(payAmount),
        paymentMethod,
      });
      setSelectedTxn(null);
      setPayAmount(0);
      fetchData();
    } catch {
      alert('Payment processing failed');
    }
  };

  const resetTxnForm = () => {
    setSubtotal(0);
    setTaxAmount(0);
    setPenaltyAmount(0);
    setDiscountAmount(0);
  };

  const columns = [
    {
      header: 'Transaction ID & Type',
      accessorKey: (row: FinancialTransaction) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono text-sm">{row.txnNumber}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.txnType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Date: {new Date(row.txnDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Subtotal & Tax (GST)',
      accessorKey: (row: FinancialTransaction) => (
        <div className="text-xs font-mono">
          <p className="text-foreground">${Number(row.subtotal).toLocaleString()}</p>
          {Number(row.taxAmount) > 0 && <p className="text-muted-foreground text-[10px]">+ Tax: ${Number(row.taxAmount).toLocaleString()}</p>}
        </div>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: (row: FinancialTransaction) => (
        <div className="text-xs font-mono font-bold text-foreground">
          ${Number(row.totalAmount).toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Outstanding Balance',
      accessorKey: (row: FinancialTransaction) => (
        <div className="text-xs font-mono">
          <span className={`font-semibold ${Number(row.outstandingAmount) > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            ${Number(row.outstandingAmount).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Status & Method',
      accessorKey: (row: FinancialTransaction) => {
        if (row.status === 'PAID') {
          return (
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle className="h-3 w-3" /> PAID ({row.paymentMethod})
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3 text-amber-500" /> {row.status}
          </Badge>
        );
      },
    },
    {
      header: 'Action',
      accessorKey: (row: FinancialTransaction) => (
        <div>
          {Number(row.outstandingAmount) > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTxn(row);
                setPayAmount(Number(row.outstandingAmount));
              }}
              className="rounded-lg h-8 px-2 text-xs"
            >
              Record Payment
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
            <DollarSign className="h-6 w-6 text-primary" /> Enterprise Financial & Accounting Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chart of Accounts, Double-Entry General Ledger, Invoices, Receipts, Aging Analysis & Gateways
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsJournalModalOpen(true)} className="rounded-xl">
            <BookOpen className="h-4 w-4 mr-2" /> Post Journal Entry
          </Button>
          <Button onClick={() => setIsTxnModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> Record Transaction
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Receivables Billed" value={`$${(metrics?.totalBilled || 0).toLocaleString()}`} description="Invoices & Fees" icon={Receipt} />
        <StatCard title="Total Collections" value={`$${(metrics?.totalCollected || 0).toLocaleString()}`} description="Realized Cashflow" icon={CheckCircle} />
        <StatCard title="Total Net Outstanding" value={`$${(metrics?.totalOutstanding || 0).toLocaleString()}`} description="Unpaid Balances" icon={AlertCircle} />
        <StatCard title="Member Wallet Reserve" value={`$${(metrics?.totalWalletBalance || 0).toLocaleString()}`} description="Prepaid Advances" icon={Wallet} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'TRANSACTIONS' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Transactions & Invoices ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'ACCOUNTS' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Chart of Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('AGING')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'AGING' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent/60'
          }`}
        >
          Receivables Aging Analysis
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <LoadingSpinner message="Calculating financial ledger balances..." />
      ) : activeTab === 'TRANSACTIONS' ? (
        <DataTable columns={columns} data={transactions} emptyMessage="Zero financial transactions found." />
      ) : activeTab === 'ACCOUNTS' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> General Ledger Chart of Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-4 rounded-xl border border-border/40 bg-accent/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{acc.accountName}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{acc.accountCode}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border/30 pt-2">
                    <span className="text-muted-foreground">Type: {acc.type}</span>
                    <span className="font-bold font-mono text-emerald-500">${Number(acc.balance).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 space-y-2 border-primary/20 bg-primary/5">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Current (0 - 30 Days)</h4>
            <p className="text-2xl font-bold font-mono text-foreground">${(aging?.current0To30 || 0).toLocaleString()}</p>
          </Card>
          <Card className="p-4 space-y-2 border-amber-500/20 bg-amber-500/5">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">31 - 60 Days Due</h4>
            <p className="text-2xl font-bold font-mono text-amber-500">${(aging?.days31To60 || 0).toLocaleString()}</p>
          </Card>
          <Card className="p-4 space-y-2 border-orange-500/20 bg-orange-500/5">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">61 - 90 Days Due</h4>
            <p className="text-2xl font-bold font-mono text-orange-500">${(aging?.days61To90 || 0).toLocaleString()}</p>
          </Card>
          <Card className="p-4 space-y-2 border-red-500/20 bg-red-500/5">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">90+ Days Overdue</h4>
            <p className="text-2xl font-bold font-mono text-red-500">${(aging?.days90Plus || 0).toLocaleString()}</p>
          </Card>
        </div>
      )}

      {/* Modal: Create Transaction */}
      {isTxnModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Record Transaction</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsTxnModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateTxn} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Transaction Type</label>
                <select
                  value={txnType}
                  onChange={(e) => setTxnType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="INVOICE">Invoice</option>
                  <option value="RECEIPT">Receipt</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="CREDIT_NOTE">Credit Note</option>
                  <option value="DEBIT_NOTE">Debit Note</option>
                  <option value="WALLET_TOPUP">Member Wallet Topup</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Subtotal Amount ($) *</label>
                <Input type="number" value={subtotal} onChange={(e) => setSubtotal(Number(e.target.value))} placeholder="500" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Tax Amount (GST)</label>
                  <Input type="number" value={taxAmount} onChange={(e) => setTaxAmount(Number(e.target.value))} placeholder="90" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Discount ($)</label>
                  <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} placeholder="0" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsTxnModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Record & Post Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Double-Entry Journal Entry */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Post Double-Entry Journal</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsJournalModalOpen(false)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateJournal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Narration *</label>
                <Input value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g. Monthly Electricity Utility Transfer" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Debit Account (+)</label>
                <select
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="">Select Debit Account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Credit Account (-)</label>
                <select
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="">Select Credit Account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Balanced Entry Amount ($) *</label>
                <Input type="number" value={journalAmount} onChange={(e) => setJournalAmount(Number(e.target.value))} placeholder="1200" required />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setIsJournalModalOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Post Double-Entry Journal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Receipt Payment */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold font-display">Record Receipt Payment</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTxn(null)} className="rounded-xl h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handlePayTxn} className="space-y-4">
              <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-1 font-mono">
                <p className="font-bold">{selectedTxn.txnNumber}</p>
                <p className="text-muted-foreground">Outstanding: ${Number(selectedTxn.outstandingAmount).toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Amount ($) *</label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs"
                >
                  <option value="RAZORPAY">Razorpay Gateway</option>
                  <option value="STRIPE">Stripe Gateway</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <Button type="button" variant="outline" onClick={() => setSelectedTxn(null)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl">
                  Process Payment Receipt
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
