import React from 'react';
import { Camera, MapPin, Bell, ClipboardCopy, Share2, RefreshCw, Nfc, Fingerprint, Smartphone, Monitor } from 'lucide-react';
import { usePermissions, useDeviceInfo } from '../hooks/useDeviceHardware';

export const DeviceSettingsPage: React.FC = () => {
  const permissions = usePermissions();
  const deviceInfo = useDeviceInfo();

  const getBadgeColor = (status: string) => {
    if (status === 'granted' || status === 'supported') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'prompt') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'granted') return 'Granted';
    if (status === 'supported') return 'Available';
    if (status === 'prompt') return 'Ask';
    if (status === 'denied') return 'Denied';
    return 'Not Available';
  };

  const items = [
    { name: 'Camera', icon: <Camera className="w-5 h-5" />, status: permissions.camera },
    { name: 'Location', icon: <MapPin className="w-5 h-5" />, status: permissions.geolocation },
    { name: 'Notifications', icon: <Bell className="w-5 h-5" />, status: permissions.notifications },
    { name: 'Clipboard', icon: <ClipboardCopy className="w-5 h-5" />, status: permissions.clipboard },
    { name: 'Share API', icon: <Share2 className="w-5 h-5" />, status: permissions.share },
    { name: 'Background Sync', icon: <RefreshCw className="w-5 h-5" />, status: permissions.backgroundSync },
    { name: 'NFC', icon: <Nfc className="w-5 h-5" />, status: 'unsupported' },
    { name: 'Biometrics', icon: <Fingerprint className="w-5 h-5" />, status: 'unsupported' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Device Permission Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hardware capabilities and device access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {deviceInfo.os === 'Android' || deviceInfo.os === 'iOS' ? (
              <Smartphone className="w-6 h-6 text-blue-600" />
            ) : (
              <Monitor className="w-6 h-6 text-blue-600" />
            )}
            <h2 className="text-lg font-semibold">Device Info</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Operating System</span>
              <span className="font-medium text-gray-900">{deviceInfo.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Browser</span>
              <span className="font-medium text-gray-900">{deviceInfo.browser}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">App Mode</span>
              <span className="font-medium text-gray-900">{deviceInfo.isPWA ? 'PWA (Installed)' : 'Browser Tabs'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Hardware APIs</h2>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    {item.icon}
                  </div>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
