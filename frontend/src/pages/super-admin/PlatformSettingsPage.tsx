import React from 'react';
import { Settings, Save, Server, Mail, MessageSquare, HardDrive, Shield, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

export default function PlatformSettingsPage() {
  const handleSave = () => {
    toast.success('Settings saved successfully');
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

        {/* Security Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Security Policies
            </CardTitle>
            <CardDescription>Global authentication rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Password Min Length</span>
              <Input className="col-span-2" readOnly defaultValue="8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Require MFA</span>
              <div className="col-span-2">
                <Badge variant="success">Enabled</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">JWT Expiry</span>
              <Input className="col-span-2" readOnly defaultValue="15 minutes" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Refresh Token Expiry</span>
              <Input className="col-span-2" readOnly defaultValue="7 days" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Session Timeout</span>
              <Input className="col-span-2" readOnly defaultValue="30 minutes" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Max Failed Logins</span>
              <Input className="col-span-2" readOnly defaultValue="5" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Lockout Duration</span>
              <Input className="col-span-2" readOnly defaultValue="15 minutes" />
            </div>
          </CardContent>
        </Card>

        {/* Platform Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-muted-foreground" />
              Platform Controls
            </CardTitle>
            <CardDescription>Feature flags and global toggles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Maintenance Mode</span>
              <div className="col-span-2">
                <Badge variant="secondary">Off</Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Global Announcement</span>
              <Input className="col-span-2" readOnly placeholder="No active announcements" />
            </div>
            
            <div className="pt-4 border-t mt-4">
              <h4 className="text-sm font-medium mb-4">Feature Flags</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beta Features</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dark Mode</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Advanced Analytics</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Suggestions</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
