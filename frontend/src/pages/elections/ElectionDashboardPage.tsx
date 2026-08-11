import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Vote, 
  Users, 
  PlusCircle, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Crown, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  Phone, 
  ChevronRight, 
  Award,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { toast } from 'sonner';

export const ElectionDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [activeTab, setActiveTab] = useState<'ELECTIONS' | 'RESULTS' | 'COMMITTEE' | 'ARCHIVE'>('ELECTIONS');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    activeElections: 2,
    upcomingElections: 1,
    completedElections: 4,
    committeeMembers: 12,
    votesCast: 342,
    pendingVotes: 86,
  });

  // Mock Elections Data
  const [elections, setElections] = useState([
    {
      id: 'el-001',
      title: 'Managing Committee General Election 2026-2027',
      committee: 'Executive Managing Committee',
      startDate: '2026-08-01',
      endDate: '2026-08-15',
      status: 'VOTING_OPEN',
      positionsCount: 5,
      candidatesCount: 12,
      votesCast: 248,
      totalEligible: 300,
      turnout: 82.6,
      quorumMet: true,
      positions: [
        {
          title: 'PRESIDENT',
          seats: 1,
          candidates: [
            { id: 'c1', name: 'Ramesh Shah', votes: 142, percent: 57.2, isWinner: true, status: 'WINNER' },
            { id: 'c2', name: 'Vikram Malhotra', votes: 106, percent: 42.8, isWinner: false, status: 'RUNNER_UP' },
          ],
        },
        {
          title: 'SECRETARY',
          seats: 1,
          candidates: [
            { id: 'c3', name: 'Sunita Deshmukh', votes: 165, percent: 66.5, isWinner: true, status: 'WINNER' },
            { id: 'c4', name: 'Alok Verma', votes: 83, percent: 33.5, isWinner: false, status: 'RUNNER_UP' },
          ],
        },
        {
          title: 'TREASURER',
          seats: 1,
          candidates: [
            { id: 'c5', name: 'Kiran Patel', votes: 130, percent: 52.4, isWinner: true, status: 'WINNER' },
            { id: 'c6', name: 'Deepak Joshi', votes: 118, percent: 47.6, isWinner: false, status: 'RUNNER_UP' },
          ],
        },
      ],
    },
    {
      id: 'el-002',
      title: 'Green Initiative & Waste Management Sub-Committee Election',
      committee: 'Environmental Sub-Committee',
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      status: 'NOMINATION_OPEN',
      positionsCount: 3,
      candidatesCount: 6,
      votesCast: 94,
      totalEligible: 300,
      turnout: 31.3,
      quorumMet: false,
      positions: [
        {
          title: 'CONVENER',
          seats: 1,
          candidates: [
            { id: 'c7', name: 'Meera Nambiar', votes: 54, percent: 57.4, isWinner: fontWinner(54, 40), status: 'WINNER' },
            { id: 'c8', name: 'Sanjay Gupta', votes: 40, percent: 42.6, isWinner: false, status: 'RUNNER_UP' },
          ],
        },
      ],
    },
  ]);

  function fontWinner(v1: number, v2: number) {
    return v1 > v2;
  }

  // Active Selected Election for Detailed Results View
  const [selectedElection, setSelectedElection] = useState<any>(elections[0]);

  // Committee Roster Data
  const activeCommittee = {
    name: 'Executive Managing Committee (Tenure 2025–2027)',
    startDate: '01 Jan 2025',
    endDate: '31 Dec 2027',
    progress: 55,
    daysRemaining: 512,
    members: [
      { id: 'cm-1', designation: 'President', name: 'Ramesh Shah', phone: '+91 98765 11111', term: '2025–2027', status: 'Active', flat: 'A-501' },
      { id: 'cm-2', designation: 'Vice President', name: 'Priya Nair', phone: '+91 98765 22222', term: '2025–2027', status: 'Active', flat: 'B-204' },
      { id: 'cm-3', designation: 'Secretary', name: 'Sunita Deshmukh', phone: '+91 98765 33333', term: '2025–2027', status: 'Active', flat: 'A-402' },
      { id: 'cm-4', designation: 'Treasurer', name: 'Kiran Patel', phone: '+91 98765 44444', term: '2025–2027', status: 'Active', flat: 'C-102' },
      { id: 'cm-5', designation: 'Joint Secretary', name: 'Rajesh Kulkarni', phone: '+91 98765 55555', term: '2025–2027', status: 'Active', flat: 'B-401' },
      { id: 'cm-6', designation: 'Maintenance Head', name: 'Anil Mehta', phone: '+91 98765 66666', term: '2025–2027', status: 'Active', flat: 'A-103' },
      { id: 'cm-7', designation: 'Security Convener', name: 'Col. S. Swamy', phone: '+91 98765 77777', term: '2025–2027', status: 'Active', flat: 'C-304' },
      { id: 'cm-8', designation: 'Garden & Greenery', name: 'Sudha Murthy', phone: '+91 98765 88888', term: '2025–2027', status: 'Active', flat: 'B-101' },
      { id: 'cm-9', designation: 'Events & Culture', name: 'Neha Agrawal', phone: '+91 98765 99999', term: '2025–2027', status: 'Active', flat: 'A-302' },
      { id: 'cm-10', designation: 'Parking Admin', name: 'Vikram Rathod', phone: '+91 98765 00000', term: '2025–2027', status: 'Active', flat: 'C-502' },
    ],
  };

  // Voting Channel Breakdown for Recharts Pie
  const channelData = [
    { name: 'Mobile App', value: 210, fill: '#2563EB' },
    { name: 'Gate QR Scanner', value: 82, fill: '#10B981' },
    { name: 'Web Portal', value: 50, fill: '#6366F1' },
  ];

  // Export & Report Actions
  const handleExportPDF = () => {
    toast.success('Downloading Election Results Report (PDF)...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting Election Results to Excel (.xlsx)...');
  };

  const handlePrintResults = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* ------------------------------------------------------------- */}
      {/* COMPACT TOOLBAR HEADER (Zero Overflow, Responsive Buttons) */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-[22px] bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
        
        {/* Title & 2-Line Subtext */}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Vote className="h-5 w-5" />
            </div>
            <span>Election & Committee Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage society elections, candidate nominations, voting channels, committee formations, and automated election results.
          </p>
        </div>

        {/* Action Buttons (Responsive flex-wrap, h-10 compact size, 100% visible) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 lg:pt-0">
          <Button
            onClick={() => navigate('/elections/create')}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" /> Create Election
          </Button>

          <Button
            onClick={() => setActiveTab('COMMITTEE')}
            variant={activeTab === 'COMMITTEE' ? 'default' : 'outline'}
            className={`h-10 px-3.5 rounded-xl text-xs font-semibold gap-1.5 whitespace-nowrap border-slate-200 ${
              activeTab === 'COMMITTEE' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4 text-purple-600" /> View Committee
          </Button>

          <Button
            onClick={() => setActiveTab('RESULTS')}
            variant={activeTab === 'RESULTS' ? 'default' : 'outline'}
            className={`h-10 px-3.5 rounded-xl text-xs font-semibold gap-1.5 whitespace-nowrap border-slate-200 ${
              activeTab === 'RESULTS' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-blue-600" /> View Results
          </Button>

          <Button
            onClick={() => setActiveTab('ARCHIVE')}
            variant={activeTab === 'ARCHIVE' ? 'default' : 'outline'}
            className={`h-10 px-3.5 rounded-xl text-xs font-semibold gap-1.5 whitespace-nowrap border-slate-200 ${
              activeTab === 'ARCHIVE' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Archive className="h-4 w-4 text-emerald-600" /> Archive
          </Button>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6 COMPACT DASHBOARD STATISTICS CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500">Active Elections</span>
            <Vote className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.activeElections}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-center text-indigo-400">
            <span className="text-[11px] font-semibold text-indigo-700">Upcoming</span>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold font-mono text-indigo-900 mt-1">{stats.upcomingElections}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-center text-emerald-400">
            <span className="text-[11px] font-semibold text-emerald-700">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-900 mt-1">{stats.completedElections}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-center text-purple-400">
            <span className="text-[11px] font-semibold text-purple-700">Committee Members</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-mono text-purple-900 mt-1">{stats.committeeMembers}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-center text-amber-400">
            <span className="text-[11px] font-semibold text-amber-700">Votes Cast</span>
            <BarChart3 className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-900 mt-1">{stats.votesCast}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-semibold text-slate-500">Pending Votes</span>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-700 mt-1">{stats.pendingVotes}</p>
        </div>

      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          size="sm"
          variant={activeTab === 'ELECTIONS' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('ELECTIONS')}
          className={`rounded-xl text-xs font-bold px-4 h-9 ${
            activeTab === 'ELECTIONS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Current Elections ({elections.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'RESULTS' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('RESULTS')}
          className={`rounded-xl text-xs font-bold px-4 h-9 ${
            activeTab === 'RESULTS' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Election Results Dashboard
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'COMMITTEE' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('COMMITTEE')}
          className={`rounded-xl text-xs font-bold px-4 h-9 ${
            activeTab === 'COMMITTEE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Committee Roster
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'ARCHIVE' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('ARCHIVE')}
          className={`rounded-xl text-xs font-bold px-4 h-9 ${
            activeTab === 'ARCHIVE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Election Archive
        </Button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CURRENT ELECTIONS TABLE / LIST */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ELECTIONS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-[22px] border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold font-display text-slate-900">Current & Upcoming Elections</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search election name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs h-9 rounded-xl border-slate-200"
                />
              </div>
            </div>

            {elections.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <Vote className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-slate-900 font-bold text-sm">No Election Created</h3>
                <p className="text-slate-500 text-xs mt-1">Create your first election for society committee formation.</p>
                <Button onClick={() => navigate('/elections/create')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl">
                  Create Election
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {elections.map((election) => (
                  <div key={election.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          election.status === 'VOTING_OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {election.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-slate-500 font-medium">{election.committee}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 truncate">{election.title}</h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span>Period: <strong>{election.startDate}</strong> to <strong>{election.endDate}</strong></span>
                        <span>Turnout: <strong className="text-blue-700 font-mono">{election.turnout}%</strong></span>
                        <span>Votes Cast: <strong className="text-slate-900 font-mono">{election.votesCast} / {election.totalEligible}</strong></span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${election.turnout}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedElection(election);
                          setActiveTab('RESULTS');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-xs"
                      >
                        <BarChart3 className="h-3.5 w-3.5" /> View Results
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/elections/candidates/${election.id}`)}
                        className="h-9 text-xs rounded-xl border-slate-300 font-semibold"
                      >
                        Candidates ({election.candidatesCount})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: ELECTION RESULTS DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-6">
          
          {/* Results Header Card */}
          <div className="bg-white p-6 rounded-[22px] border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 mb-1.5">
                  Official Election Results
                </Badge>
                <h2 className="text-xl font-bold font-display text-slate-900">{selectedElection?.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{selectedElection?.committee} • Voting Turnout: {selectedElection?.turnout}%</p>
              </div>

              {/* Export Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={handleExportPDF} className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export PDF Report
                </Button>
                <Button size="sm" onClick={handleExportExcel} variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export Excel
                </Button>
                <Button size="sm" onClick={handlePrintResults} variant="outline" className="h-9 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5">
                  <Printer className="h-3.5 w-3.5" /> Print Result
                </Button>
              </div>
            </div>

            {/* Turnout & Quorum Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Eligible Voters</span>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{selectedElection?.totalEligible}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase">Total Votes Cast</span>
                <p className="text-base font-bold text-blue-900 font-mono mt-0.5">{selectedElection?.votesCast}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Voter Turnout</span>
                <p className="text-base font-bold text-emerald-900 font-mono mt-0.5">{selectedElection?.turnout}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] text-purple-600 font-bold uppercase">Quorum Status</span>
                <p className="text-sm font-bold text-purple-900 mt-0.5">{selectedElection?.quorumMet ? 'MET (Valid)' : 'NOT MET'}</p>
              </div>
            </div>
          </div>

          {/* Recharts Graphs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bar Chart: Candidate Vote Distribution */}
            <div className="lg:col-span-8 bg-white p-5 rounded-[22px] border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-sm font-display text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" /> Position-Wise Candidate Vote Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedElection?.positions[0]?.candidates || []}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                      {(selectedElection?.positions[0]?.candidates || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.isWinner ? '#10B981' : '#2563EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Voting Channels */}
            <div className="lg:col-span-4 bg-white p-5 rounded-[22px] border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-sm font-display text-slate-900 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-blue-600" /> Voting Channel Breakdown
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2">
                {channelData.map((ch) => (
                  <div key={ch.name} className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ch.fill }} />
                      {ch.name}
                    </span>
                    <strong className="font-mono text-slate-900">{ch.value} votes</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Candidate Results Roster by Position */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg font-display text-slate-900">Position-Wise Certified Results</h3>

            {selectedElection?.positions.map((pos: any, idx: number) => (
              <div key={idx} className="bg-white p-5 rounded-[22px] border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-slate-900 font-display flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" /> Position: {pos.title}
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-bold">1 Seat</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pos.candidates.map((cand: any) => (
                    <div
                      key={cand.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        cand.isWinner
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-full font-bold text-sm flex items-center justify-center border ${
                          cand.isWinner ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}>
                          {cand.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            {cand.name}
                            {cand.isWinner && <Crown className="h-4 w-4 text-amber-500 shrink-0" />}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium">{cand.votes} Votes ({cand.percent}%)</p>
                        </div>
                      </div>

                      <Badge className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        cand.isWinner ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 border-none'
                      }`}>
                        {cand.isWinner ? 'WINNER' : 'RUNNER UP'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: ACTIVE COMMITTEE ROSTER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'COMMITTEE' && (
        <div className="space-y-6">
          
          {/* Active Committee Overview Header */}
          <div className="bg-white p-6 rounded-[22px] border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <Badge className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 mb-1">
                  Active Society Committee
                </Badge>
                <h2 className="text-xl font-bold font-display text-slate-900">{activeCommittee.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tenure: {activeCommittee.startDate} to {activeCommittee.endDate}</p>
              </div>

              <Badge className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 self-start sm:self-center">
                Tenure Active ({activeCommittee.daysRemaining} days remaining)
              </Badge>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Tenure Elapsed Progress</span>
                <span>{activeCommittee.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${activeCommittee.progress}%` }} />
              </div>
            </div>
          </div>

          {/* Committee Member Roster Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg font-display text-slate-900">Executive Committee Roster ({activeCommittee.members.length} Members)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeCommittee.members.map((member) => (
                <div key={member.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center border border-purple-200">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 my-0.5">
                        {member.designation}
                      </Badge>
                      <p className="text-[11px] text-slate-500">{member.flat} • {member.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: ELECTION ARCHIVE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ARCHIVE' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[22px] border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Archive className="h-5 w-5 text-emerald-600" /> Completed Elections & Past Results Archive
            </h2>

            <div className="space-y-3 text-xs">
              {[
                { title: 'Executive Managing Committee Election 2024-2025', date: 'Dec 2024', turnout: '88.4%', winner: 'Ramesh Shah' },
                { title: 'Special General Body Election 2023', date: 'Nov 2023', turnout: '79.2%', winner: 'Priya Nair' },
                { title: 'Managing Committee Election 2022-2023', date: 'Dec 2022', turnout: '85.0%', winner: 'Vikram Malhotra' },
              ].map((arch, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{arch.title}</h3>
                    <p className="text-slate-500 mt-0.5">Certified Date: {arch.date} • Turnout: {arch.turnout} • Winner: {arch.winner}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleExportPDF} className="h-8 text-xs font-semibold rounded-xl border-slate-300">
                    <Download className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Report
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
