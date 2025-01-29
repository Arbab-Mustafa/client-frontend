import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  title: string;
}

export default function AudioPlayer({ url, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleError = () => {
      console.error('Audio error:', audio.error);
      setError(`Failed to load audio: ${audio.error?.message || 'Unknown error'}`);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [url]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setError(null);
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play audio');
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || isLoading) return;
    
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = (x / bounds.width) * 100;
    const time = (percentage / 100) * duration;
    
    audioRef.current.currentTime = time;
    setProgress(percentage);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-400 p-2 bg-red-900/20 rounded">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`p-2 text-yellow-400 transition-colors rounded-full hover:bg-gray-700/50 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-yellow-300'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="flex-1 space-y-1">
          <div
            className="h-2 bg-gray-700 rounded-full cursor-pointer relative"
            onClick={handleProgressClick}
          >
            <div
              className="absolute h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {!isLoading && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(duration * (progress / 100))}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}
        </div>

        <button
          onClick={toggleMute}
          disabled={isLoading}
          className={`p-2 text-yellow-400 transition-colors rounded-full hover:bg-gray-700/50 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-yellow-300'
          }`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
      />
    </div>
  );
}