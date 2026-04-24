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
  },
  {
    id: 4,
    title: "CYBER_GHOST_DAT",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: 5,
    title: "ROOTKIT_INITIALIZED",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  }
];

export default function MusicPlayer() {
  const [currentTrackId, setCurrentTrackId] = useState(TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const filteredTracks = TRACKS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const currentTrack = TRACKS.find(t => t.id === currentTrackId) || TRACKS[0];

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
  }, [currentTrackId]);

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
    const listToUse = filteredTracks.length > 0 ? filteredTracks : TRACKS;
    const currentIndex = listToUse.findIndex(t => t.id === currentTrackId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % listToUse.length : 0;
    setCurrentTrackId(listToUse[nextIndex].id);
    setIsPlaying(true);
  };

  const playPrev = () => {
    const listToUse = filteredTracks.length > 0 ? filteredTracks : TRACKS;
    const currentIndex = listToUse.findIndex(t => t.id === currentTrackId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : listToUse.length - 1;
    setCurrentTrackId(listToUse[prevIndex].id);
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
        AUDIO_MODULE_v3.0
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

      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center bg-black border-2 border-cyan-500 p-2 focus-within:border-fuchsia-500 transition-colors">
          <span className="text-fuchsia-500 font-pixel text-xs mr-2 mt-0.5">&gt;</span>
          <input
            type="text"
            className="bg-transparent border-none outline-none text-cyan-400 font-mono text-sm w-full uppercase placeholder-cyan-800"
            placeholder="SEARCH_TRACK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Track List */}
      <div className="mb-6 h-32 overflow-y-auto border-2 border-cyan-500 p-2 bg-black/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-cyan-500">
        {filteredTracks.length > 0 ? (
          filteredTracks.map(track => (
            <div 
              key={track.id} 
              onClick={() => {
                setCurrentTrackId(track.id);
                setIsPlaying(true);
              }}
              className={`font-mono text-sm cursor-pointer p-1 truncate hover:bg-cyan-900/40 transition-colors ${
                track.id === currentTrackId 
                  ? 'text-fuchsia-500 font-bold bg-fuchsia-900/20' 
                  : 'text-cyan-600'
              }`}
            >
              [{track.id.toString().padStart(2, '0')}] {track.title} {track.id === currentTrackId && (isPlaying ? ' (PLAYING)' : ' (PAUSED)')}
            </div>
          ))
        ) : (
          <div className="font-mono text-sm text-red-500 p-1 animate-pulse">ERR: NO_MATCH_FOUND</div>
        )}
      </div>

      {/* Raw Progress Bar */}
      <div className="w-full h-4 border-2 border-cyan-500 mb-6 relative">
        <div 
          className="h-full bg-fuchsia-500 transition-all duration-100 ease-linear"
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
