import { useEffect, useRef, useState } from 'react';

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [reactGameState, setReactGameState] = useState<'PLAYING' | 'PAUSED' | 'GAME_OVER'>('PLAYING');

  // Mutable game state for requestAnimationFrame
  const snake = useRef<Point[]>([{ x: 10, y: 10 }]);
  const direction = useRef<Point>({ x: 0, y: -1 });
  const nextDirection = useRef<Point>({ x: 0, y: -1 });
  const food = useRef<Point>({ x: 5, y: 5 });
  const particles = useRef<Particle[]>([]);
  const shake = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const moveTimer = useRef<number>(0);
  const gameState = useRef<'PLAYING' | 'PAUSED' | 'GAME_OVER'>('PLAYING');
  const animationRef = useRef<number>(0);

  const spawnFood = () => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.current.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    food.current = newFood;
  };

  const spawnParticles = (x: number, y: number, color: string = '#0ff') => {
    for (let i = 0; i < 15; i++) {
      particles.current.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  const resetGame = () => {
    snake.current = [{ x: 10, y: 10 }];
    direction.current = { x: 0, y: -1 };
    nextDirection.current = { x: 0, y: -1 };
    spawnFood();
    particles.current = [];
    shake.current = 0;
    setScore(0);
    gameState.current = 'PLAYING';
    setReactGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (gameState.current === 'GAME_OVER') {
          resetGame();
        } else if (gameState.current === 'PLAYING') {
          gameState.current = 'PAUSED';
          setReactGameState('PAUSED');
        } else if (gameState.current === 'PAUSED') {
          gameState.current = 'PLAYING';
          setReactGameState('PLAYING');
        }
        return;
      }

      if (gameState.current !== 'PLAYING') return;

      const { x, y } = direction.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (y !== 1) nextDirection.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (y !== -1) nextDirection.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (x !== 1) nextDirection.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (x !== -1) nextDirection.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const deltaTime = timestamp - lastTime.current;
      lastTime.current = timestamp;

      update(deltaTime);
      draw(ctx);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    const update = (deltaTime: number) => {
      // Update particles regardless of pause state for juice
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= deltaTime * 0.002;
      });
      particles.current = particles.current.filter(p => p.life > 0);

      if (shake.current > 0) {
        shake.current -= deltaTime * 0.05;
        if (shake.current < 0) shake.current = 0;
      }

      if (gameState.current !== 'PLAYING') return;

      moveTimer.current += deltaTime;
      if (moveTimer.current >= 100) { // Speed
        moveTimer.current = 0;
        
        const newHead = {
          x: snake.current[0].x + nextDirection.current.x,
          y: snake.current[0].y + nextDirection.current.y
        };
        direction.current = nextDirection.current;

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          triggerGameOver();
          return;
        }

        // Self collision
        if (snake.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
          triggerGameOver();
          return;
        }

        snake.current.unshift(newHead);

        // Eat food
        if (newHead.x === food.current.x && newHead.y === food.current.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          shake.current = 5;
          spawnParticles(food.current.x, food.current.y, '#f0f'); // Magenta particles
          spawnFood();
        } else {
          snake.current.pop();
        }
      }
    };

    const triggerGameOver = () => {
      gameState.current = 'GAME_OVER';
      setReactGameState('GAME_OVER');
      shake.current = 20;
      spawnParticles(snake.current[0].x, snake.current[0].y, '#0ff'); // Cyan explosion
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.save();
      if (shake.current > 0) {
        const dx = (Math.random() - 0.5) * shake.current;
        const dy = (Math.random() - 0.5) * shake.current;
        ctx.translate(dx, dy);
      }

      // Draw Grid (subtle)
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#f0f'; // Magenta
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f0f';
      // Glitch effect on food
      const foodOffset = Math.random() > 0.9 ? (Math.random() - 0.5) * 4 : 0;
      ctx.fillRect(food.current.x * CELL_SIZE + 2 + foodOffset, food.current.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      ctx.shadowBlur = 0;

      // Draw Snake
      snake.current.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#fff' : '#0ff'; // White head, Cyan body
        ctx.shadowBlur = index === 0 ? 15 : 5;
        ctx.shadowColor = '#0ff';
        ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
      ctx.shadowBlur = 0;

      // Draw Particles
      particles.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 4, 4);
      });
      ctx.globalAlpha = 1.0;

      ctx.restore();
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [highScore]);

  return (
    <div className="flex flex-col items-center w-full max-w-[400px]">
      <div className="flex justify-between w-full mb-2 font-pixel text-xs text-cyan-500">
        <div>SCORE:{score.toString().padStart(4, '0')}</div>
        <div className="text-fuchsia-500">HIGH:{highScore.toString().padStart(4, '0')}</div>
      </div>
      
      <div className="relative border-4 border-cyan-500 bg-black w-full aspect-square">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full block"
        />
        
        {reactGameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            <h2 className="text-2xl font-pixel text-red-500 mb-4 glitch" data-text="SYSTEM FAILURE">SYSTEM FAILURE</h2>
            <p className="text-cyan-500 font-mono mb-6 text-xl">SCORE: {score}</p>
            <button 
              onClick={resetGame}
              className="px-4 py-2 bg-black border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-pixel text-sm uppercase transition-none cursor-pointer"
            >
              [ REBOOT ]
            </button>
          </div>
        )}

        {reactGameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <h2 className="text-xl font-pixel text-fuchsia-500 glitch" data-text="DATA STREAM PAUSED">DATA STREAM PAUSED</h2>
          </div>
        )}
      </div>
    </div>
  );
}
