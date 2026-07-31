import React, { useState } from 'react';
import { Vote, Plus, ArrowLeft, Save, ShieldCheck, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CreatePollPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState('OPINION_POLL');
  const [votingRule, setVotingRule] = useState('ONE_VOTE_PER_FLAT');
  const [quorumPercentage, setQuorumPercentage] = useState(50);
  const [isSecretBallot, setIsSecretBallot] = useState(false);
  const [targetAudience, setTargetAudience] = useState('ENTIRE_SOCIETY');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Please enter poll title');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title,
          description,
          pollType,
          votingRule,
          quorumPercentage: Number(quorumPercentage),
          isSecretBallot,
          targetAudience,
        }),
      });

      if (!res.ok) throw new Error('Failed to create poll');

      toast.success('Poll created and published successfully!');
      navigate('/polls');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/polls')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Create Decision Poll or AGM Resolution</h1>
          <p className="text-xs text-muted-foreground">Configure voting rules, target audience, quorum threshold, and secrecy settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display">1. Poll Details & Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Poll Title / Resolution Heading</label>
              <Input placeholder="e.g. 2026 Annual Sinking Fund Maintenance Rate Revision" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Description & Context</label>
              <Input placeholder="Brief details explaining the resolution or survey purpose..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Decision Category</label>
                <select className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs" value={pollType} onChange={(e) => setPollType(e.target.value)}>
                  <option value="OPINION_POLL">Opinion Poll</option>
                  <option value="SURVEY">Resident Survey</option>
                  <option value="AGM_RESOLUTION">AGM Resolution</option>
                  <option value="COMMITTEE_RESOLUTION">Committee Resolution</option>
                  <option value="VENDOR_SELECTION">Vendor Selection</option>
                  <option value="BUDGET_APPROVAL">Budget Approval</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Target Audience Builder</label>
                <select className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
                  <option value="ENTIRE_SOCIETY">Entire Society (All Units)</option>
                  <option value="OWNER_ONLY">Owners Only</option>
                  <option value="TENANT_ONLY">Tenants Only</option>
                  <option value="COMMITTEE_ONLY">Management Committee Only</option>
                  <option value="BUILDING_A">Building A Only</option>
                  <option value="BUILDING_B">Building B Only</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold font-display flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> 2. Governance Rules & Secrecy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Voting Rule</label>
                <select className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs" value={votingRule} onChange={(e) => setVotingRule(e.target.value)}>
                  <option value="ONE_VOTE_PER_FLAT">One Vote Per Flat</option>
                  <option value="ONE_VOTE_PER_RESIDENT">One Vote Per Resident</option>
                  <option value="OWNER_ONLY">Owner Entitlement Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Required Quorum Threshold (%)</label>
                <Input type="number" min="0" max="100" value={quorumPercentage} onChange={(e) => setQuorumPercentage(Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border">
              <div>
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-500" /> Enable Secret Ballot
                </p>
                <p className="text-[10px] text-muted-foreground">Voter identities are cryptographically anonymized in audit reports</p>
              </div>
              <input type="checkbox" checked={isSecretBallot} onChange={(e) => setIsSecretBallot(e.target.checked)} className="h-5 w-5 rounded border-gray-300" />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-4 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/polls')} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl text-xs gap-1.5 shadow-sm">
              <Save className="h-4 w-4" /> Publish Decision Poll
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
