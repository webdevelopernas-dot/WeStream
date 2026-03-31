import React, { useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface StreamPlayerProps {
  url?: string;
  isLive?: boolean;
  streamRef?: React.RefObject<HTMLVideoElement | null>;
}

export default function StreamPlayer({ url, isLive, streamRef }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (streamRef && streamRef.current && videoRef.current) {
      // This is for live camera stream
      videoRef.current.srcObject = streamRef.current.srcObject;
    }
  }, [streamRef]);

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group border border-white/10 shadow-2xl">
      {isLive && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">
            Live
          </span>
          <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-sm text-[10px] text-white/80 font-mono">
            00:00:00
          </div>
        </div>
      )}

      {url ? (
        <video 
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          controls={!isLive}
        />
      ) : (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      )}

      {!url && !streamRef && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
          <Play size={48} className="mb-4" />
          <p className="text-sm font-medium">Waiting for stream...</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
