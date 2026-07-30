import React from 'react';
import { CreditCard, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { DataTable } from '../../components/shared/DataTable';

export default function SubscriptionManagementPage() {
  const plans = [
    {
      name: 'Starter',
      price: '₹2,999/mo',
      limits: ['Up to 100 units', '5 admin users', '1 GB storage', 'Email support'],
      modules: ['Billing, Complaints, Notices'],
      activeCount: 12,
      popular: false
    },
    {
      name: 'Professional',
      price: '₹7,999/mo',
      limits: ['Up to 500 units', '20 admin users', '10 GB storage', 'Priority support'],
      modules: ['All Starter', 'Visitors, Parking, Amenities, Meetings'],
      activeCount: 18,
      popular: false
    },
    {
      name: 'Enterprise',
      price: '₹14,999/mo',
      limits: ['Unlimited units', 'Unlimited users', '100 GB storage', 'Dedicated support'],
      modules: ['All modules'],
      activeCount: 8,
      popular: true
    },
    {
      name: 'Custom',
      price: 'Contact Sales',
      limits: ['Custom limits', 'White-label', 'API access', 'SLA guarantee'],
      modules: ['Custom'],
      activeCount: 4,
      popular: false
    }
  ];

  const featuresMatrix = [
    { id: '1', feature: 'Billing', starter: true, professional: true, enterprise: true, custom: true },
    { id: '2', feature: 'Complaints', starter: true, professional: true, enterprise: true, custom: true },
    { id: '3', feature: 'Notices', starter: true, professional: true, enterprise: true, custom: true },
    { id: '4', feature: 'Visitors', starter: false, professional: true, enterprise: true, custom: true },
    { id: '5', feature: 'Parking', starter: false, professional: true, enterprise: true, custom: true },
    { id: '6', feature: 'Amenities', starter: false, professional: true, enterprise: true, custom: true },
    { id: '7', feature: 'Meetings', starter: false, professional: true, enterprise: true, custom: true },
    { id: '8', feature: 'Documents', starter: false, professional: true, enterprise: true, custom: true },
    { id: '9', feature: 'Analytics', starter: false, professional: false, enterprise: true, custom: true },
    { id: '10', feature: 'Gatekeeper', starter: false, professional: false, enterprise: true, custom: true },
    { id: '11', feature: 'Maintenance', starter: false, professional: false, enterprise: true, custom: true }
  ];

  const renderCheck = (val: boolean) => val ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-muted-foreground" />;

  const columns: { header: string; accessorKey: any }[] = [
    { header: 'Feature', accessorKey: 'feature' },
    { header: 'Starter', accessorKey: (row: any) => renderCheck(row.starter) },
    { header: 'Professional', accessorKey: (row: any) => renderCheck(row.professional) },
    { header: 'Enterprise', accessorKey: (row: any) => renderCheck(row.enterprise) },
    { header: 'Custom', accessorKey: (row: any) => renderCheck(row.custom) },
  ];

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-display tracking-tight">Subscription Plans</h1>
        </div>
        <Button>+ Create Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <Card key={i} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-md' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant="secondary">{plan.activeCount} active</Badge>
              </div>
              <CardDescription className="text-xl font-bold text-foreground mt-2">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Limits:</p>
                {plan.limits.map((limit, j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{limit}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Modules:</p>
                {plan.modules.map((mod, j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Edit Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features Matrix</CardTitle>
          <CardDescription>Detailed comparison of features across plans</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={featuresMatrix} emptyMessage="No features found." />
        </CardContent>
      </Card>
    </div>
  );
}
