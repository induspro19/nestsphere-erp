import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { User, Check, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const CandidateManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/elections/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Mock candidates for now
        setCandidates(data.data?.candidates || [
          { id: 1, name: 'John Doe', position: 'CHAIRPERSON', type: 'SELF', status: 'SUBMITTED', manifesto: 'I promise to fix the lift.' }
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <h1 className="text-3xl font-display font-bold">Candidate Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate: any) => (
          <Card key={candidate.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User className="text-gray-500" /></div>
              <div>
                <CardTitle>{candidate.name}</CardTitle>
                <Badge className="mr-2">{candidate.position}</Badge>
                <Badge variant="outline">{candidate.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">Status: <Badge>{candidate.status}</Badge></p>
              <p className="text-sm text-gray-600 line-clamp-3">{candidate.manifesto}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700"><Check className="w-4 h-4 mr-1" /> Approve</Button>
              <Button size="sm" variant="destructive"><X className="w-4 h-4 mr-1" /> Reject</Button>
              <Button size="sm" variant="outline" className="text-amber-600 border-amber-600"><AlertTriangle className="w-4 h-4 mr-1" /> Req Docs</Button>
              <Button size="sm" variant="destructive"><AlertCircle className="w-4 h-4 mr-1" /> Disqualify</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
