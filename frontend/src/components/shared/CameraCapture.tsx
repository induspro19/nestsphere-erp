import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (image: string | File) => void;
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async (mode: 'user' | 'environment') => {
    stopCamera();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error accessing camera', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-md ${className}`}>
      <div className="flex items-center gap-2 mb-4 text-gray-800">
        <Camera className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Camera Capture</h2>
      </div>

      <div className="relative w-full max-w-md overflow-hidden bg-gray-900 rounded-lg aspect-[3/4] sm:aspect-video flex items-center justify-center border-2 border-gray-300">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="object-contain w-full h-full" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="object-cover w-full h-full"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {capturedImage ? (
          <>
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="w-4 h-4" /> Retake
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Check className="w-4 h-4" /> Confirm
            </button>
          </>
        ) : (
          <>
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Camera className="w-4 h-4" /> Capture Photo
            </button>
            <button
              onClick={toggleCamera}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              title="Flip Camera"
            >
              <RefreshCw className="w-4 h-4" /> Switch
            </button>
          </>
        )}
      </div>
    </div>
  );
};
