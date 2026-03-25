import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyImage from './assets/key.png';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthHeader } from './components/AuthHeader';
import { useApi } from './hooks/useApi';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
  isSpecial: boolean;
  revealedPoints?: number;
}

function Game() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const { token } = useAuth();
  const { post } = useApi();

  const initializeGame = () => {
    // Randomly assign treasure to one box, special chest to another
    const treasureBoxIndex = Math.floor(Math.random() * 4);
    let specialBoxIndex = Math.floor(Math.random() * 4);
    while (specialBoxIndex === treasureBoxIndex) {
      specialBoxIndex = Math.floor(Math.random() * 4);
    }
    const newBoxes: Box[] = Array.from({ length: 4 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
      isSpecial: index === specialBoxIndex,
    }));
    
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  // Initialize game automatically when component mounts
  useEffect(() => {
    initializeGame();
  }, []);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const points = box.hasTreasure ? 100 : box.isSpecial ? (Math.random() < 0.5 ? 200 : -200) : -50;
          setScore(prev => prev + points);
          const sound = new Audio(box.hasTreasure || (box.isSpecial && points > 0) ? chestOpenSound : evilLaughSound);
          sound.play();
          return { ...box, isOpen: true, revealedPoints: points };
        }
        return box;
      });

      // Check if treasure is found or all boxes are opened
      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
        // Save score if logged in
        if (token) {
          const finalScore = updatedBoxes.reduce((acc, box) => {
            if (!box.isOpen) return acc;
            return acc + (box.revealedPoints ?? 0);
          }, 0);
          post('/api/scores', { score: finalScore }).catch(() => {});
        }
      }
      
      return updatedBoxes;
    });
  };

  const resetGame = () => {
    initializeGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col">
      <AuthHeader />
      <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50 | ⭐ Special: ±$200
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`mt-2 text-center text-lg font-semibold p-3 rounded-lg border-2 ${
              score > 0
                ? 'bg-green-100 border-green-400 text-green-700'
                : score === 0
                ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                : 'bg-red-100 border-red-400 text-red-700'
            }`}
          >
            {score > 0 ? '🎉 You Win!' : score === 0 ? '🤝 It\'s a Tie!' : '💀 You Lose!'}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 max-w-2xl w-full">
            {boxes.map((box) => (
              <motion.div
                key={box.id}
                className="flex flex-col items-center"
                style={{ cursor: box.isOpen ? 'default' : `url(${keyImage}) 16 16, pointer` }}
                whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
                whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
                onClick={() => openBox(box.id)}
              >
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: box.isOpen ? 180 : 0,
                    scale: box.isOpen ? 1.1 : 1
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  style={{ width: 120, height: 120, position: 'relative', flexShrink: 0 }}
                >
                  {/* Special chest glow indicator (before open) */}
                  {!box.isOpen && box.isSpecial && (
                    <div className="absolute inset-0 rounded-lg animate-pulse ring-4 ring-yellow-400 ring-offset-2 pointer-events-none" />
                  )}
                  <img
                    src={box.isOpen
                      ? (box.hasTreasure ? treasureChest : skeletonChest)
                      : closedChest
                    }
                    alt={box.isOpen
                      ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                      : box.isSpecial ? "Special Chest" : "Treasure Chest"
                    }
                    style={{ width: 120, height: 120, objectFit: 'contain' }}
                    className={!box.isOpen && box.isSpecial ? 'drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]' : 'drop-shadow-lg'}
                  />

                  {box.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    >
                      {box.hasTreasure ? (
                        <div className="text-2xl animate-bounce">✨💰✨</div>
                      ) : box.isSpecial && (box.revealedPoints ?? 0) > 0 ? (
                        <div className="text-2xl animate-bounce">⭐🎊⭐</div>
                      ) : box.isSpecial ? (
                        <div className="text-2xl animate-pulse">⭐💥⭐</div>
                      ) : (
                        <div className="text-2xl animate-pulse">💀👻💀</div>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                <div className="mt-3 text-center">
                  {/* Special badge before open */}
                  {!box.isOpen && box.isSpecial && (
                    <div className="text-xs font-bold text-yellow-600 bg-yellow-100 border border-yellow-400 rounded px-2 py-0.5 mb-1">
                      ⭐ SPECIAL
                    </div>
                  )}
                  {box.isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className={`text-lg p-2 rounded-lg ${
                        (box.revealedPoints ?? 0) > 0
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {(box.revealedPoints ?? 0) > 0 ? `+$${box.revealedPoints}` : `-$${Math.abs(box.revealedPoints ?? 0)}`}
                    </motion.div>
                  ) : (
                    <div className="text-amber-700 p-2 text-sm">
                      Click to open!
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
      </div>

      {gameEnded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
                <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
                <p className="text-lg text-amber-800">
                  Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${score}
                  </span>
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  {boxes.some(box => box.isOpen && box.hasTreasure)
                    ? 'Treasure found! Well done, treasure hunter! 🎉'
                    : boxes.some(box => box.isOpen && box.isSpecial && (box.revealedPoints ?? 0) > 0)
                    ? 'Special chest bonus! Lucky you! ⭐'
                    : 'No treasure found this time! Better luck next time! 💀'}
                </p>
              </div>
              
              <Button 
                onClick={resetGame}
                className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Play Again
              </Button>
            </motion.div>
          )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Game />
    </AuthProvider>
  );
}
