import { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 1,
    title: "ERR_0x01_CORRUPTION",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "SYS_OVERRIDE_SEQ",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "MEM_LEAK_DETECTED",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error("Playback failed:", e);
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  return (
    <div className="w-full p-6 bg-black border-4 border-cyan-500 relative">
      <div className="absolute top-0 left-0 bg-cyan-500 text-black font-pixel text-[10px] px-2 py-1">
        AUDIO_MODULE_v2.4
      </div>
      
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />
      
      <div className="mt-6 mb-4">
        <h3 className="font-pixel text-sm text-fuchsia-500 mb-1">
          {isPlaying ? '&gt; STREAMING...' : '&gt; PAUSED'}
        </h3>
        <div className="font-mono text-2xl text-cyan-400 uppercase tracking-widest truncate">
          {currentTrack.title}
        </div>
      </div>

      {/* Raw Progress Bar */}
      <div className="w-full h-4 border-2 border-cyan-500 mb-6 relative">
        <div 
          className="h-full bg-fuchsia-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <button 
            onClick={playPrev}
            className="px-3 py-1 bg-black border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black font-pixel text-xs transition-none cursor-pointer"
          >
            [PREV]
          </button>
          <button 
            onClick={togglePlay}
            className="px-3 py-1 bg-black border-2 border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-pixel text-xs transition-none cursor-pointer"
          >
            {isPlaying ? '[PAUSE]' : '[PLAY]'}
          </button>
          <button 
            onClick={playNext}
            className="px-3 py-1 bg-black border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black font-pixel text-xs transition-none cursor-pointer"
          >
            [NEXT]
          </button>
        </div>
        
        <div className="flex items-center gap-2 font-pixel text-xs text-cyan-500">
          <span>VOL:</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 appearance-none bg-black border-2 border-cyan-500 h-3 accent-fuchsia-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
