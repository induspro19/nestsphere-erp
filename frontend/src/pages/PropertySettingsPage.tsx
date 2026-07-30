import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { propertyApi, PropertyConfig, PropertyBlock } from '../api/property.api';
import { Building2, Sliders, CheckCircle2, Layers, Home, Plus } from 'lucide-react';

export const PropertySettingsPage: React.FC = () => {
  const [config, setConfig] = useState<PropertyConfig | null>(null);
  const [blocks, setBlocks] = useState<PropertyBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [blockLabel, setBlockLabel] = useState('Tower');
  const [hasWings, setHasWings] = useState(true);
  const [hasFloors, setHasFloors] = useState(true);
  const [isSeparateParking, setIsSeparateParking] = useState(true);
  const [autoUnitNumbering, setAutoUnitNumbering] = useState(true);
  const [unitNumberPattern, setUnitNumberPattern] = useState('{block}-{wing}-{unit}');

  // New Block state
  const [newBlockName, setNewBlockName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const hierarchy = await propertyApi.getHierarchy();
      setConfig(hierarchy.config);
      setBlocks(hierarchy.blocks);

      if (hierarchy.config) {
        setBlockLabel(hierarchy.config.blockLabel);
        setHasWings(hierarchy.config.hasWings);
        setHasFloors(hierarchy.config.hasFloors);
        setIsSeparateParking(hierarchy.config.isSeparateParking);
        setAutoUnitNumbering(hierarchy.config.autoUnitNumbering);
        setUnitNumberPattern(hierarchy.config.unitNumberPattern);
      }
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const updated = await propertyApi.updateConfig({
        blockLabel,
        hasWings,
        hasFloors,
        isSeparateParking,
        autoUnitNumbering,
        unitNumberPattern,
      });
      setConfig(updated);
      setMessage('Property management settings updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBlock = async () => {
    if (!newBlockName.trim()) return;
    try {
      await propertyApi.createBlock({ name: newBlockName });
      setNewBlockName('');
      fetchData();
    } catch {
      // Error handling
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading property management engine..." />;
  }

  const unitTypeOptions = [
    'APARTMENT',
    'VILLA',
    'ROW_HOUSE',
    'OFFICE',
    'SHOP',
    'WAREHOUSE',
    'PENTHOUSE',
    'STUDIO',
    'DUPLEX',
    'PARKING_UNIT',
    'STORAGE_UNIT',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-accent/30 to-background flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Property Management Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure generic property hierarchy, custom numbering rules, and unit type specifications
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-xs">
          Generic Property Engine v1.0
        </Badge>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Property Configuration Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="h-5 w-5 text-primary" /> Property Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Block / Building Label
                </label>
                <Input
                  value={blockLabel}
                  onChange={(e) => setBlockLabel(e.target.value)}
                  placeholder="e.g. Tower, Block, Building, Complex"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWings}
                    onChange={(e) => setHasWings(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Wings Exist (e.g. East Wing, Wing A)</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFloors}
                    onChange={(e) => setHasFloors(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Floors Exist (e.g. 1st Floor, 2nd Floor)</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSeparateParking}
                    onChange={(e) => setIsSeparateParking(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Parking Allocated Separately</span>
                </label>

                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoUnitNumbering}
                    onChange={(e) => setAutoUnitNumbering(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Auto Unit Numbering Engine</span>
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Numbering Pattern
                </label>
                <Input
                  value={unitNumberPattern}
                  onChange={(e) => setUnitNumberPattern(e.target.value)}
                  placeholder="{block}-{wing}-{unit}"
                />
                <p className="text-[11px] text-muted-foreground">
                  Examples: <code className="bg-accent px-1 rounded">Tower-A-101</code>,{' '}
                  <code className="bg-accent px-1 rounded">Villa-12</code>,{' '}
                  <code className="bg-accent px-1 rounded">Office-302</code>,{' '}
                  <code className="bg-accent px-1 rounded">Shop-G15</code>
                </p>
              </div>

              <Button type="submit" className="w-full rounded-xl mt-4" disabled={isSaving}>
                {isSaving ? 'Saving Settings...' : 'Save Property Config'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Supported Unit Types & Property Structure Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supported Unit Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="h-5 w-5 text-primary" /> Supported Unit Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unitTypeOptions.map((type) => (
                  <Badge key={type} variant="secondary" className="px-3 py-1 rounded-lg text-xs font-medium">
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Structure Hierarchy Tree */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-5 w-5 text-primary" /> Registered {blockLabel}s ({blocks.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`New ${blockLabel} Name...`}
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  className="w-48 text-xs"
                />
                <Button size="sm" onClick={handleCreateBlock} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-1" /> Add {blockLabel}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {blocks.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl">
                  No {blockLabel}s added yet. Click Add {blockLabel} to create your property structure.
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-xl border border-border/40 bg-accent/20 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-sm">{block.name}</p>
                        <p className="text-xs text-muted-foreground">Code: {block.code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Configured Label: {blockLabel}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
