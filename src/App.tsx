import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="crt noise min-h-screen bg-black text-cyan-500 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-8">
        <header className="text-center w-full border-b-4 border-fuchsia-600 pb-4 mb-4">
          <h1 className="font-pixel text-4xl md:text-6xl glitch screen-tear text-fuchsia-500 uppercase tracking-tighter" data-text="SYS.SNAKE_OS">
            SYS.SNAKE_OS
          </h1>
          <p className="text-cyan-400 font-mono tracking-widest uppercase text-lg mt-2 animate-pulse">
            [ ASSIMILATION PROTOCOL ACTIVE ]
          </p>
        </header>
        
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full">
          <div className="flex-1 flex justify-center w-full border-2 border-cyan-500 p-2 bg-black/50 relative">
            <div className="absolute top-0 left-0 w-2 h-2 bg-fuchsia-500"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-fuchsia-500"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-fuchsia-500"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-fuchsia-500"></div>
            <SnakeGame />
          </div>
          
          <div className="flex-1 flex flex-col items-center lg:items-start gap-8 w-full">
            <MusicPlayer />
            
            <div className="w-full border-2 border-fuchsia-500 p-4 bg-black/80 text-cyan-400 font-mono text-sm">
              <h3 className="text-fuchsia-500 font-pixel text-xs mb-2">&gt;&gt; SYSTEM_LOG</h3>
              <p>&gt; INITIALIZING NEURAL LINK...</p>
              <p>&gt; AUDIO_SUBSYSTEM: ONLINE</p>
              <p>&gt; KINETIC_CONTROLS: WASD / ARROWS</p>
              <p>&gt; INTERRUPT: SPACEBAR</p>
              <p className="animate-pulse mt-2 text-red-500">&gt; AWAITING INPUT...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
