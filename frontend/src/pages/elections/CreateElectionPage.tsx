import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const CreateElectionPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ type: 'AGM_COMMITTEE', positions: [], rules: {} });
  const navigate = useNavigate();

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/elections', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Election created successfully');
        navigate('/elections');
      } else {
        toast.error('Failed to create election');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <h1 className="text-3xl font-display font-bold">Create Election</h1>
      
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`w-3 h-3 rounded-full ${s === step ? 'bg-primary' : 'bg-gray-300'}`}></div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {step}</CardTitle>
          <CardDescription>Fill out the details for your new election.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <select className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="AGM_COMMITTEE">AGM Committee</option>
                <option value="SGM_COMMITTEE">SGM Committee</option>
                <option value="BY_ELECTION">By Election</option>
              </select>
              <Input placeholder="Election Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="w-full p-2 border rounded" placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          )}
          {step === 2 && (
            <div>
              <p>Add positions here (CHAIRPERSON, etc.)</p>
            </div>
          )}
          {step === 3 && (
            <div>
              <p>Timeline dates</p>
            </div>
          )}
          {step === 4 && (
            <div>
              <p>Rules (Quorum, Secret Ballot, Proxy)</p>
            </div>
          )}
          {step === 5 && (
            <div>
              <p>Review Summary</p>
              <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(formData, null, 2)}</pre>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>Back</Button>
            {step < 5 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Publish</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
