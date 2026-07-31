import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export const CommitteeManagementPage: React.FC = () => {
  const [activeCommittee, setActiveCommittee] = useState<any>(null);
  const [pastCommittees, setPastCommittees] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/elections/committees/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Mock data
        setActiveCommittee({
          name: 'Managing Committee 2023-2024',
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          progress: 65,
          daysRemaining: 120,
          members: [
            { name: 'John Doe', position: 'CHAIRPERSON', joined: '2023-01-01' }
          ]
        });
        setPastCommittees([
          { name: 'Managing Committee 2022-2023' }
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <h1 className="text-3xl font-display font-bold">Committee Management</h1>

      {activeCommittee ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{activeCommittee.name}</CardTitle>
              <CardDescription>{activeCommittee.startDate} to {activeCommittee.endDate}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Tenure Progress</span>
                  <span>{activeCommittee.daysRemaining} days remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${activeCommittee.progress}%` }}></div>
                </div>
              </div>
              
              <h3 className="font-semibold mb-4 mt-6">Roster</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeCommittee.members.map((m: any, i: number) => (
                  <Card key={i} className="bg-secondary/10">
                    <CardContent className="p-4">
                      <p className="font-bold">{m.name}</p>
                      <Badge className="mt-1 mb-2">{m.position}</Badge>
                      <p className="text-xs text-gray-500">Joined: {m.joined}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="mb-4">No active committee found.</p>
            <Button>Form New Committee</Button>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-semibold mt-8">Past Committees</h2>
      <div className="space-y-4">
        {pastCommittees.map((c: any, i: number) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="font-medium">{c.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
