import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, Lock, Clock, ShieldCheck, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export const ResidentPollsPage: React.FC = () => {
  const [polls, setPolls] = useState<any[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<any>(null);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch('/api/polls', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPolls(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCastVote = async () => {
    if (!selectedChoice || !selectedPoll) {
      toast.error('Please select an option to vote');
      return;
    }

    setVoting(true);
    try {
      const res = await fetch(`/api/polls/${selectedPoll.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          choiceId: selectedChoice,
          source: 'APP',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit vote');

      toast.success(data.message || 'Vote cast successfully!');
      setSelectedPoll(null);
      setSelectedChoice('');

      // Refresh polls
      const refreshed = await fetch('/api/polls', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then((r) => r.json());
      setPolls(Array.isArray(refreshed) ? refreshed : []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const activePolls = polls.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
          <Vote className="h-5 w-5 text-primary" /> Society Decision Polls & Voting
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cast your vote on AGM Resolutions, Budget Approvals, and Community Decisions
        </p>
      </div>

      {/* Active Polls List */}
      <div className="space-y-3">
        {activePolls.map((poll) => (
          <Card key={poll.id} className="p-4 space-y-3 border-border/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {poll.pollType}
                  </Badge>
                  {poll.isSecretBallot && (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      <Lock className="h-2.5 w-2.5 mr-0.5" /> Secret Ballot
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-bold font-display">{poll.title}</h3>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{poll.description}</p>

            <Button
              onClick={() => {
                setSelectedPoll(poll);
                setSelectedChoice('');
              }}
              className="w-full rounded-xl text-xs gap-1.5 shadow-sm"
            >
              <Vote className="h-4 w-4" /> Vote Now
            </Button>
          </Card>
        ))}
      </div>

      {/* Interactive Voting Modal */}
      {selectedPoll && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-5 space-y-4">
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px]">{selectedPoll.pollType}</Badge>
              <h2 className="text-base font-bold font-display pt-1">{selectedPoll.title}</h2>
              <p className="text-xs text-muted-foreground">{selectedPoll.description}</p>
            </div>

            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-bold">Select Your Decision:</p>
              {selectedPoll.choices?.map((choice: any) => (
                <div
                  key={choice.id}
                  onClick={() => setSelectedChoice(choice.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedChoice === choice.id
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                      : 'border-border/60 hover:bg-muted/50'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{choice.text}</p>
                    {choice.description && <p className="text-[10px] opacity-80">{choice.description}</p>}
                  </div>
                  {selectedChoice === choice.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setSelectedPoll(null)} className="w-1/2 rounded-xl text-xs">
                Cancel
              </Button>
              <Button onClick={handleCastVote} disabled={voting || !selectedChoice} className="w-1/2 rounded-xl text-xs shadow-sm">
                Submit Vote
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
