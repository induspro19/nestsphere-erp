import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ResidentElectionsPage: React.FC = () => {
  const [activeElection, setActiveElection] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingModalOpen, setVotingModalOpen] = useState(false);

  useEffect(() => {
    // Mock fetch
    setActiveElection({
      id: '1',
      title: 'Annual General Election 2024',
      endDate: '2024-12-31T23:59:59Z',
      positions: [
        {
          id: 'p1',
          title: 'CHAIRPERSON',
          candidates: [
            { id: 'c1', name: 'John Doe', manifesto: 'I will improve security.' },
            { id: 'c2', name: 'Jane Smith', manifesto: 'Better maintenance.' }
          ]
        }
      ]
    });
  }, []);

  const handleVoteSubmit = async () => {
    try {
      // Mock submit
      setHasVoted(true);
      setVotingModalOpen(false);
      toast.success('Vote submitted successfully');
    } catch (err) {
      toast.error('Failed to submit vote');
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <h1 className="text-3xl font-display font-bold">Society Elections & Committee Voting</h1>

      {activeElection && !hasVoted && (
        <div className="bg-primary/10 p-4 rounded-lg border border-primary flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">{activeElection.title} is live!</h2>
            <p className="text-sm">Voting ends: {new Date(activeElection.endDate).toLocaleString()}</p>
          </div>
          <Button onClick={() => setVotingModalOpen(true)}>Vote Now</Button>
        </div>
      )}

      {hasVoted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-green-700">Your vote has been recorded</h2>
            <p className="text-sm text-green-600 mt-2">{new Date().toLocaleString()}</p>
            <Button disabled className="mt-4">Cannot Vote Again</Button>
          </CardContent>
        </Card>
      )}

      {activeElection && (
        <div className="space-y-6">
          {activeElection.positions.map((pos: any) => (
            <div key={pos.id}>
              <h3 className="text-xl font-semibold mb-4">{pos.title} Candidates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pos.candidates.map((cand: any) => (
                  <Card key={cand.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User className="text-gray-500" /></div>
                      <div>
                        <CardTitle>{cand.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-2">{cand.manifesto}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">Read Full Manifesto</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {votingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeElection?.positions.map((pos: any) => (
                <div key={pos.id} className="space-y-2">
                  <h4 className="font-semibold">{pos.title}</h4>
                  <div className="space-y-2">
                    {pos.candidates.map((cand: any) => (
                      <label key={cand.id} className="flex items-center gap-4 p-4 border rounded cursor-pointer hover:bg-gray-50">
                        <input type="radio" name={`pos-${pos.id}`} value={cand.id} />
                        <span>{cand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setVotingModalOpen(false)}>Cancel</Button>
                <Button onClick={handleVoteSubmit}>Confirm Vote</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Election History</h2>
        <p className="text-gray-500">No past elections found.</p>
      </div>
    </div>
  );
};
