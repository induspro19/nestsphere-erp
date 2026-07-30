import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useGeolocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, error, loading, requestLocation };
}

export function useShare() {
  const share = useCallback(async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
        return false;
      }
    } else {
      // Fallback to clipboard
      if (data.url || data.text) {
        try {
          await navigator.clipboard.writeText((data.url || data.text) as string);
          toast.success('Link copied to clipboard!');
          return true;
        } catch (err) {
          toast.error('Failed to copy to clipboard.');
          return false;
        }
      }
      return false;
    }
  }, []);

  return share;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState({
    camera: 'prompt',
    geolocation: 'prompt',
    notifications: 'prompt',
    clipboard: 'prompt',
    share: 'supported',
    backgroundSync: 'prompt',
  });

  useEffect(() => {
    const checkPermissions = async () => {
      const getStatus = async (name: PermissionName | 'background-sync' | 'clipboard-read' | 'clipboard-write') => {
        try {
          const status = await navigator.permissions.query({ name: name as PermissionName });
          return status.state;
        } catch (e) {
          return 'unsupported';
        }
      };

      setPermissions({
        camera: await getStatus('camera'),
        geolocation: await getStatus('geolocation'),
        notifications: await getStatus('notifications'),
        clipboard: await getStatus('clipboard-read' as any),
        share: 'share' in navigator ? 'supported' : 'unsupported',
        backgroundSync: await getStatus('background-sync' as any),
      });
    };

    checkPermissions();
  }, []);

  return permissions;
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({
    isPWA: false,
    userAgent: '',
    os: '',
    browser: '',
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    let os = 'Unknown';
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    if (ua.indexOf('Mac') !== -1) os = 'MacOS';
    if (ua.indexOf('Linux') !== -1) os = 'Linux';
    if (ua.indexOf('Android') !== -1) os = 'Android';
    if (ua.indexOf('like Mac') !== -1) os = 'iOS';

    let browser = 'Unknown';
    if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
    else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

    setDeviceInfo({ isPWA, userAgent: ua, os, browser });
  }, []);

  return deviceInfo;
}

export function useNFC() {
  return { supported: false, requestNFC: async () => false };
}

export function useBiometrics() {
  return { supported: false, requestBiometrics: async () => false };
}
