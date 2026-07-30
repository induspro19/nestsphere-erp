import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Square, Play, RefreshCw, QrCode } from 'lucide-react';

interface UniversalQRScannerProps {
  onScanSuccess: (text: string) => void;
  onScanFailure?: (err: any) => void;
  className?: string;
}

export const UniversalQRScanner: React.FC<UniversalQRScannerProps> = ({
  onScanSuccess,
  onScanFailure,
  className = '',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setActiveCameraId(devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras', err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!activeCameraId) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }

      await scannerRef.current.start(
        activeCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner', err);
      }
    }
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCameraId = cameras[nextIndex].id;
    
    stopScanner().then(() => {
      setActiveCameraId(nextCameraId);
      setTimeout(() => {
        startScanner();
      }, 200);
    });
  };

  return (
    <div className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-md ${className}`}>
      <div className="flex items-center gap-2 mb-4 text-gray-800">
        <QrCode className="w-6 h-6" />
        <h2 className="text-xl font-semibold">QR Scanner</h2>
      </div>

      <div id={containerId} className="w-full max-w-md overflow-hidden rounded-lg bg-gray-100 min-h-[300px] flex items-center justify-center relative border-2 border-dashed border-gray-300">
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Camera className="w-12 h-12 mb-2 opacity-50" />
            <p>Scanner is off</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {!isScanning ? (
          <button
            onClick={startScanner}
            disabled={!activeCameraId}
            className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="flex items-center gap-2 px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <Square className="w-4 h-4" /> Stop Scanner
          </button>
        )}

        {cameras.length > 1 && (
          <button
            onClick={switchCamera}
            disabled={!isScanning}
            className="flex items-center gap-2 px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Switch Camera
          </button>
        )}
      </div>
    </div>
  );
};
