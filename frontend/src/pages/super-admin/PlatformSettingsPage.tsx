import React, { useState } from 'react';
import { Settings, Save, Mail, MessageSquare, HardDrive, Shield, Sliders, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import {
  getGlobalCurrencyConfig,
  setGlobalCurrencyConfig,
  formatCurrency,
  CurrencyConfig,
} from '../../utils/currencyFormatter';

export default function PlatformSettingsPage() {
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig>(getGlobalCurrencyConfig());

  const updateCurrency = (patch: Partial<CurrencyConfig>) => {
    const updated = { ...currencyConfig, ...patch };
    setCurrencyConfig(updated);
    setGlobalCurrencyConfig(updated);
  };

  const handleSave = () => {
    setGlobalCurrencyConfig(currencyConfig);
    toast.success('Global Platform & Currency Settings saved successfully!');
  };

  const handleTest = (service: string) => {
    toast(`Test initiated for ${service}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-display tracking-tight">Platform Settings</h1>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Currency & Financial Settings */}
        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-r from-card via-card/95 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Global Currency & Financial Formatting Configuration
            </CardTitle>
            <CardDescription>
              Centralized currency rules, symbols, positioning, and digit grouping applied globally across all ERP modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Currency Name</label>
                <select
                  value={currencyConfig.currencyName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Indian Rupee') {
                      updateCurrency({ currencyName: 'Indian Rupee', symbol: '₹', code: 'INR', locale: 'en-IN' });
                    } else if (val === 'US Dollar') {
                      updateCurrency({ currencyName: 'US Dollar', symbol: '$', code: 'USD', locale: 'en-US' });
                    } else if (val === 'Euro') {
                      updateCurrency({ currencyName: 'Euro', symbol: '€', code: 'EUR', locale: 'de-DE' });
                    } else if (val === 'British Pound') {
                      updateCurrency({ currencyName: 'British Pound', symbol: '£', code: 'GBP', locale: 'en-GB' });
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs font-medium"
                >
                  <option value="Indian Rupee">Indian Rupee (INR - ₹)</option>
                  <option value="US Dollar">US Dollar (USD - $)</option>
                  <option value="Euro">Euro (EUR - €)</option>
                  <option value="British Pound">British Pound (GBP - £)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Currency Symbol</label>
                <Input
                  value={currencyConfig.symbol}
                  onChange={(e) => updateCurrency({ symbol: e.target.value })}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Currency Code</label>
                <Input
                  value={currencyConfig.code}
                  onChange={(e) => updateCurrency({ code: e.target.value })}
                  className="text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Symbol Position</label>
                <select
                  value={currencyConfig.symbolPosition}
                  onChange={(e) => updateCurrency({ symbolPosition: e.target.value as 'before' | 'after' })}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-xs font-medium"
                >
                  <option value="before">Before Amount (e.g. ₹ 1,25,000.00)</option>
                  <option value="after">After Amount (e.g. 1,25,000.00 ₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Decimal Places</label>
                <Input
                  type="number"
                  min={0}
                  max={4}
                  value={currencyConfig.decimalPlaces}
                  onChange={(e) => updateCurrency({ decimalPlaces: parseInt(e.target.value) || 2 })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Thousands Separator</label>
                <Input
                  value={currencyConfig.thousandsSeparator}
                  onChange={(e) => updateCurrency({ thousandsSeparator: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Decimal Separator</label>
                <Input
                  value={currencyConfig.decimalSeparator}
                  onChange={(e) => updateCurrency({ decimalSeparator: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Live Formatted Output Preview */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Live Currency Formatting Preview</p>
                <p className="text-xs text-muted-foreground mt-0.5">Indian Numbering System (Lakhs/Crores grouping: 1,23,45,678.90)</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-primary">
                  {formatCurrency(12345678.9)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              Email Configuration (SMTP)
            </CardTitle>
            <CardDescription>Manage global email sending settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">SMTP Host</span>
              <Input className="col-span-2" readOnly defaultValue="smtp.nestsphere.com" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">SMTP Port</span>
              <Input className="col-span-2" readOnly defaultValue="587" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">SMTP User</span>
              <Input className="col-span-2" readOnly defaultValue="noreply@nestsphere.com" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Encryption</span>
              <div className="col-span-2">
                <Badge variant="outline">TLS</Badge>
              </div>
            </div>
            <div className="pt-2">
              <Button variant="secondary" onClick={() => handleTest('SMTP')}>Test Connection</Button>
            </div>
          </CardContent>
        </Card>

        {/* SMS Gateway */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              SMS Gateway
            </CardTitle>
            <CardDescription>Configure SMS provider for OTPs and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Provider</span>
              <div className="col-span-2">
                <Badge>Twilio</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">API Key</span>
              <Input className="col-span-2" readOnly defaultValue="••••••••abcd" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Sender ID</span>
              <Input className="col-span-2" readOnly defaultValue="NESTSP" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Monthly Quota</span>
              <span className="col-span-2 text-sm">10,000</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Used This Month</span>
              <span className="col-span-2 text-sm">3,456</span>
            </div>
            <div className="pt-2">
              <Button variant="secondary" onClick={() => handleTest('SMS Gateway')}>Test Gateway</Button>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Business */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              WhatsApp Business
            </CardTitle>
            <CardDescription>Meta Business API settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Provider</span>
              <div className="col-span-2">
                <Badge variant="outline">Meta Business API</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Phone Number</span>
              <span className="col-span-2 text-sm">+91-9876543210</span>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Status</span>
              <div className="col-span-2">
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Templates</span>
              <span className="col-span-2 text-sm">12 approved</span>
            </div>
          </CardContent>
        </Card>

        {/* Storage & CDN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              Storage & CDN
            </CardTitle>
            <CardDescription>File uploads and asset delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Provider</span>
              <div className="col-span-2">
                <Badge>AWS S3</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Bucket</span>
              <Input className="col-span-2" readOnly defaultValue="nestsphere-prod" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Region</span>
              <Input className="col-span-2" readOnly defaultValue="ap-south-1" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">CDN</span>
              <div className="col-span-2">
                <Badge variant="outline">CloudFront</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Cache TTL</span>
              <Input className="col-span-2" readOnly defaultValue="3600s" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
