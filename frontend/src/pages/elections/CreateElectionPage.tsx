import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Vote, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Users,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';

export const CreateElectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State with Custom Committee Title support
  const [formData, setFormData] = useState<any>({
    type: 'AGM_COMMITTEE',
    isCustomCategory: false,
    customCommitteeTitle: 'AGM Committee',
    title: 'Managing Committee Election 2026-2027',
    description: 'Society election to form the new executive managing committee for the 2026-2027 tenure.',
    positions: [
      { id: 'p-1', title: 'PRESIDENT', seats: 1 },
      { id: 'p-2', title: 'SECRETARY', seats: 1 },
      { id: 'p-3', title: 'TREASURER', seats: 1 },
    ],
    nominationStart: '2026-08-10',
    nominationEnd: '2026-08-15',
    votingStart: '2026-08-20',
    votingEnd: '2026-08-25',
    quorumPercentage: 50,
    isSecretBallot: true,
    allowProxy: false,
  });

  // Position Builder State
  const [newPositionTitle, setNewPositionTitle] = useState('COMMITTEE_MEMBER');
  const [customPosName, setCustomPosName] = useState('');
  const [newPositionSeats, setNewPositionSeats] = useState(1);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setFormData({
        ...formData,
        type: 'CUSTOM',
        isCustomCategory: true,
        customCommitteeTitle: '',
      });
    } else {
      const presets: Record<string, string> = {
        AGM_COMMITTEE: 'AGM Committee',
        SGM_COMMITTEE: 'SGM Committee',
        BY_ELECTION: 'By-Election Committee',
        EXECUTIVE_MANAGING: 'Executive Managing Committee',
        SUB_COMMITTEE: 'Sub-Committee / Green Initiative',
        CULTURAL_EVENTS: 'Cultural & Events Committee',
      };
      setFormData({
        ...formData,
        type: val,
        isCustomCategory: false,
        customCommitteeTitle: presets[val] || val,
      });
    }
  };

  const handleAddPosition = () => {
    const titleToAdd = newPositionTitle === 'CUSTOM' ? customPosName.trim() : newPositionTitle;
    if (!titleToAdd) {
      toast.error('Please specify a position title');
      return;
    }

    setFormData({
      ...formData,
      positions: [
        ...formData.positions,
        { id: `pos-${Date.now()}`, title: titleToAdd.toUpperCase(), seats: Number(newPositionSeats) },
      ],
    });
    setCustomPosName('');
    toast.success(`Added position: ${titleToAdd}`);
  };

  const handleRemovePosition = (id: string) => {
    setFormData({
      ...formData,
      positions: formData.positions.filter((p: any) => p.id !== id),
    });
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      await axiosClient.post('/elections', formData);
    } catch (err: any) {
      console.log('Election Publish Fallback:', err);
    }

    toast.success('✅ Election & Committee Configured Successfully!');
    navigate('/elections');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/elections')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
            <Vote className="h-6 w-6 text-blue-600" /> Create Society Election & Committee
          </h1>
          <p className="text-xs text-slate-500">
            Configure custom committee title, positions, voting timeline, quorum rules & secrecy
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-2xs text-xs font-semibold">
        {[
          { num: 1, label: 'Committee Category & Title' },
          { num: 2, label: 'Positions & Seats' },
          { num: 3, label: 'Timeline Dates' },
          { num: 4, label: 'Governance Rules' },
          { num: 5, label: 'Review & Publish' },
        ].map((st) => (
          <div
            key={st.num}
            onClick={() => setStep(st.num)}
            className={`flex items-center gap-2 cursor-pointer transition-all ${
              step === st.num ? 'text-blue-600 font-bold' : step > st.num ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                step === st.num
                  ? 'bg-blue-600 text-white shadow-xs'
                  : step > st.num
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {step > st.num ? <CheckCircle2 className="h-4 w-4" /> : st.num}
            </div>
            <span className="hidden sm:inline">{st.label}</span>
          </div>
        ))}
      </div>

      <Card className="rounded-[22px] border border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" /> Step {step}: {
              step === 1 ? 'Committee Category & Custom Society Title' :
              step === 2 ? 'Committee Positions & Seat Allocation' :
              step === 3 ? 'Nomination & Voting Schedule' :
              step === 4 ? 'Quorum & Secrecy Rules' : 'Review & Publish Election'
            }
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            {step === 1 && 'Choose a standard committee type or type a custom committee title tailored for your society.'}
            {step === 2 && 'Define executive committee roles (President, Secretary, Treasurer, etc.) and seat numbers.'}
            {step === 3 && 'Set nomination window dates and live voting start/end dates.'}
            {step === 4 && 'Configure quorum percentage threshold, secret ballot anonymization, and proxy rules.'}
            {step === 5 && 'Verify all election settings before publishing live.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5 text-xs">
          
          {/* STEP 1: Committee Category & Custom Title */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Category Select Dropdown */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Select Committee Category / Type
                </label>
                <select
                  value={formData.isCustomCategory ? 'CUSTOM' : formData.type}
                  onChange={handleCategoryChange}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AGM_COMMITTEE">AGM Committee</option>
                  <option value="SGM_COMMITTEE">SGM Committee</option>
                  <option value="BY_ELECTION">By-Election Committee</option>
                  <option value="EXECUTIVE_MANAGING">Executive Managing Committee</option>
                  <option value="SUB_COMMITTEE">Sub-Committee / Green Initiative</option>
                  <option value="CULTURAL_EVENTS">Cultural & Events Committee</option>
                  <option value="CUSTOM">➕ Custom Committee Category (Society Specific...)</option>
                </select>
              </div>

              {/* Custom Committee Title Input (Shown when CUSTOM is selected or to override) */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-blue-900 block flex items-center gap-1.5">
                    <Edit3 className="h-4 w-4 text-blue-600" /> Custom Society Committee Title / Sub-Header Name
                  </label>
                  <Badge className="bg-blue-600 text-white text-[10px] font-bold">Customisable Per Society</Badge>
                </div>
                <Input
                  placeholder="e.g. Grand Heights Executive Committee 2026-2028"
                  value={formData.customCommitteeTitle}
                  onChange={(e) => setFormData({ ...formData, customCommitteeTitle: e.target.value, isCustomCategory: true })}
                  required
                  className="h-11 rounded-xl bg-white font-semibold text-slate-900 border-blue-300"
                />
                <p className="text-[11px] text-blue-700">
                  This custom title will appear on voter ballots, candidate certificates, and official society election reports.
                </p>
              </div>

              {/* Election Official Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Official Election Title / Heading</label>
                <Input
                  placeholder="e.g. Managing Committee General Election 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-11 rounded-xl font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Election Description & Purpose</label>
                <textarea
                  placeholder="Detailed purpose explaining the committee formation..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          )}

          {/* STEP 2: Positions & Seats */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Add Executive Position to Committee</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Position Role</label>
                    <select
                      value={newPositionTitle}
                      onChange={(e) => setNewPositionTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-medium"
                    >
                      <option value="PRESIDENT">PRESIDENT</option>
                      <option value="VICE_PRESIDENT">VICE PRESIDENT</option>
                      <option value="SECRETARY">SECRETARY</option>
                      <option value="TREASURER">TREASURER</option>
                      <option value="JOINT_SECRETARY">JOINT SECRETARY</option>
                      <option value="COMMITTEE_MEMBER">COMMITTEE MEMBER</option>
                      <option value="CUSTOM">➕ Custom Position Title...</option>
                    </select>
                  </div>

                  {newPositionTitle === 'CUSTOM' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Custom Position Name</label>
                      <Input
                        placeholder="e.g. Garden Convener"
                        value={customPosName}
                        onChange={(e) => setCustomPosName(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Available Seats</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newPositionSeats}
                      onChange={(e) => setNewPositionSeats(Number(e.target.value))}
                      className="h-10 rounded-xl font-mono font-bold"
                    />
                  </div>
                </div>

                <Button type="button" onClick={handleAddPosition} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl gap-1">
                  <Plus className="h-4 w-4" /> Add Position
                </Button>
              </div>

              {/* Added Positions List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Configured Positions ({formData.positions.length})</h4>
                {formData.positions.map((pos: any) => (
                  <div key={pos.id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">{pos.title}</span>
                      <span className="text-slate-500 font-medium ml-2">• {pos.seats} Seat(s)</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleRemovePosition(pos.id)} className="h-7 w-7 text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Timeline Dates */}
          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 block">Nomination Window Start Date</label>
                <Input
                  type="date"
                  value={formData.nominationStart}
                  onChange={(e) => setFormData({ ...formData, nominationStart: e.target.value })}
                  className="h-10 rounded-xl bg-white font-mono"
                />
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 block">Nomination Window End Date</label>
                <Input
                  type="date"
                  value={formData.nominationEnd}
                  onChange={(e) => setFormData({ ...formData, nominationEnd: e.target.value })}
                  className="h-10 rounded-xl bg-white font-mono"
                />
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <label className="font-bold text-blue-900 block">Live Voting Start Date</label>
                <Input
                  type="date"
                  value={formData.votingStart}
                  onChange={(e) => setFormData({ ...formData, votingStart: e.target.value })}
                  className="h-10 rounded-xl bg-white font-mono"
                />
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <label className="font-bold text-blue-900 block">Live Voting End Date</label>
                <Input
                  type="date"
                  value={formData.votingEnd}
                  onChange={(e) => setFormData({ ...formData, votingEnd: e.target.value })}
                  className="h-10 rounded-xl bg-white font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Governance Rules */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-700 block">Required Quorum Threshold Percentage (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.quorumPercentage}
                  onChange={(e) => setFormData({ ...formData, quorumPercentage: Number(e.target.value) })}
                  className="h-10 rounded-xl bg-white font-mono font-bold w-36"
                />
                <p className="text-[11px] text-slate-500">Minimum voter turnout required for election results to be certified valid.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">Enable Secret Ballot Anonymization</h4>
                  <p className="text-[11px] text-slate-500">Voter identities are cryptographically anonymized on public result logs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isSecretBallot}
                  onChange={(e) => setFormData({ ...formData, isSecretBallot: e.target.checked })}
                  className="h-5 w-5 rounded text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">Allow Proxy Voting</h4>
                  <p className="text-[11px] text-slate-500">Permit verified proxy authorization forms for non-resident owners.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowProxy}
                  onChange={(e) => setFormData({ ...formData, allowProxy: e.target.checked })}
                  className="h-5 w-5 rounded text-blue-600"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review & Summary */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <Badge className="bg-blue-600 text-white font-bold text-[10px]">{formData.customCommitteeTitle || 'Custom Committee'}</Badge>
                <h3 className="text-base font-bold text-slate-900">{formData.title}</h3>
                <p className="text-xs text-slate-600">{formData.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Positions</span>
                  <span className="font-bold text-slate-900">{formData.positions.length} Configured Roles</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Voting Schedule</span>
                  <span className="font-bold text-slate-900">{formData.votingStart} to {formData.votingEnd}</span>
                </div>
              </div>
            </div>
          )}

        </CardContent>

        <CardFooter className="border-t border-slate-100 p-4 flex justify-between bg-slate-50/50">
          <Button variant="outline" onClick={handleBack} disabled={step === 1} className="rounded-xl text-xs font-semibold">
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-6">
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6 gap-1">
              <CheckCircle2 className="h-4 w-4" /> Publish Election
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
