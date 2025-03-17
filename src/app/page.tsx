"use client";

import { useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  bounceCount: number;
  emoji: string;
}

interface EmojiButton {
  emoji: string;
  isConfigured: boolean;
}

export default function Home() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gravityEnabled, setGravityEnabled] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [customEmojis, setCustomEmojis] = useState<EmojiButton[]>([
    { emoji: "+", isConfigured: false },
  ]);
  const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);

  // Set up window dimensions listener
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  useEffect(() => {
    if (particles.length > 0) {
      const interval = setInterval(() => {
        setParticles((prevParticles) =>
          prevParticles
            .map((particle) => {
              let { x, y, vx, vy, opacity, bounceCount } = particle;

              // Update position
              x += vx;
              y += vy;

              // Apply gravity if enabled
              if (gravityEnabled) {
                vy += 0.3;
              }

              // Bounce off bottom
              if (y > windowDimensions.height - 20 && vy > 0) {
                if (bounceCount < 3) {
                  vy = -vy * 0.6;
                  y = windowDimensions.height - 20;
                  bounceCount++;
                } else {
                  vy = gravityEnabled ? 0 : -vy * 0.6;
                  y = windowDimensions.height - 20;
                  if (gravityEnabled) {
                    vx *= 0.9; // Friction only when gravity is on
                  }
                }
              }

              // Bounce off top
              if (y < 20 && vy < 0) {
                vy = -vy * 0.6;
                y = 20;
              }

              // Bounce off right
              if (x > windowDimensions.width - 20 && vx > 0) {
                vx = -vx * 0.6;
                x = windowDimensions.width - 20;
              }

              // Bounce off left
              if (x < 20 && vx < 0) {
                vx = -vx * 0.6;
                x = 20;
              }

              // Fade out faster when nearly stopped, but only with gravity
              const isSlowMoving = Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1;
              const fadeRate =
                gravityEnabled && isSlowMoving && bounceCount >= 3
                  ? 0.05
                  : 0.002;
              opacity -= fadeRate;

              return {
                ...particle,
                x,
                y,
                vx,
                vy,
                opacity,
                bounceCount,
              };
            })
            .filter((particle) => particle.opacity > 0)
        );
      }, 16);

      return () => clearInterval(interval);
    }
  }, [particles, windowDimensions, gravityEnabled]);

  const createExplosion = (event: React.MouseEvent, emoji: string) => {
    // Random position within the visible area, accounting for borders
    const padding = 60; // Keep explosions away from the edges
    const centerX =
      padding + Math.random() * (windowDimensions.width - padding * 2);
    const centerY =
      padding + Math.random() * (windowDimensions.height - padding * 2);

    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => {
      // Random spawn offset
      const spawnRadius = Math.random() * 10; // Random radius up to 10px
      const spawnAngle = Math.random() * Math.PI * 2; // Random angle
      const spawnX = centerX + Math.cos(spawnAngle) * spawnRadius;
      const spawnY = centerY + Math.sin(spawnAngle) * spawnRadius;

      // Base angle plus random offset
      const baseAngle = (Math.PI * 2 * i) / 25;
      const randomAngleOffset = (Math.random() - 0.5) * 0.5; // ±0.25 radians of randomness
      const angle = baseAngle + randomAngleOffset;

      // Randomized speeds
      const baseSpeed = 8 + Math.random() * 6;
      const randomSpeedMultiplier = 0.7 + Math.random() * 0.6; // 70% to 130% of base speed
      const speed = baseSpeed * randomSpeedMultiplier;

      // Add some spread to the initial vertical boost
      const verticalBoost = -5 - Math.random() * 3; // -5 to -8 upward boost

      return {
        id: Date.now() + i,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + verticalBoost,
        opacity: 1,
        bounceCount: 0,
        emoji,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  };

  const handleCustomEmojiClick = (index: number, event: React.MouseEvent) => {
    const button = customEmojis[index];
    if (!button.isConfigured) {
      setConfiguringIndex(index);
    } else {
      createExplosion(event, button.emoji);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@700&display=swap");

        @keyframes rainbow {
          0% {
            color: #ff0000;
          }
          16.67% {
            color: #ff8800;
          }
          33.33% {
            color: #ffff00;
          }
          50% {
            color: #00ff00;
          }
          66.67% {
            color: #0088ff;
          }
          83.33% {
            color: #8800ff;
          }
          100% {
            color: #ff0000;
          }
        }

        @keyframes wave {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .title {
          font-family: "Quicksand", sans-serif;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.25),
            0 6px 16px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .rainbow-wave {
          display: inline-block;
          animation: rainbow 8s linear infinite;
        }

        .title span {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }

        .title span:nth-child(2) {
          animation-delay: 0.1s;
        }
        .title span:nth-child(3) {
          animation-delay: 0.2s;
        }
        .title span:nth-child(4) {
          animation-delay: 0.3s;
        }
        .title span:nth-child(5) {
          animation-delay: 0.4s;
        }
        .title span:nth-child(6) {
          animation-delay: 0.5s;
        }
        .title span:nth-child(7) {
          animation-delay: 0.6s;
        }
        .title span:nth-child(8) {
          animation-delay: 0.7s;
        }
        .title span:nth-child(9) {
          animation-delay: 0.8s;
        }
        .title span:nth-child(10) {
          animation-delay: 0.9s;
        }
        .title span:nth-child(11) {
          animation-delay: 1s;
        }
        .title span:nth-child(12) {
          animation-delay: 1.1s;
        }

        @keyframes button-glow {
          0% {
            box-shadow: 0 0 10px #ff0000, 0 0 20px #ff000066;
          }
          16.67% {
            box-shadow: 0 0 10px #ff8800, 0 0 20px #ff880066;
          }
          33.33% {
            box-shadow: 0 0 10px #ffff00, 0 0 20px #ffff0066;
          }
          50% {
            box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff0066;
          }
          66.67% {
            box-shadow: 0 0 10px #0088ff, 0 0 20px #0088ff66;
          }
          83.33% {
            box-shadow: 0 0 10px #8800ff, 0 0 20px #8800ff66;
          }
          100% {
            box-shadow: 0 0 10px #ff0000, 0 0 20px #ff000066;
          }
        }

        .button-container {
          animation: button-glow 8s linear infinite;
          border-radius: 9999px;
        }
      `}</style>
      <div className="grid grid-rows-[20px_auto_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)] relative">
        {/* Top border and gradient */}
        <div className="fixed top-0 left-0 right-0 h-[40px] bg-gray-300 pointer-events-none z-10" />
        <div className="fixed top-[40px] left-0 right-0 h-[20px] bg-gradient-to-b from-gray-300 to-transparent pointer-events-none z-10" />

        {/* Bottom border and gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-[40px] bg-gray-300 pointer-events-none z-10" />
        <div className="fixed bottom-[40px] left-0 right-0 h-[20px] bg-gradient-to-t from-gray-300 to-transparent pointer-events-none z-10" />

        {/* Left border and gradient */}
        <div className="fixed top-0 bottom-0 left-0 w-[40px] bg-gray-300 pointer-events-none z-10" />
        <div className="fixed top-0 bottom-0 left-[40px] w-[20px] bg-gradient-to-r from-gray-300 to-transparent pointer-events-none z-10" />

        {/* Right border and gradient */}
        <div className="fixed top-0 bottom-0 right-0 w-[40px] bg-gray-300 pointer-events-none z-10" />
        <div className="fixed top-0 bottom-0 right-[40px] w-[20px] bg-gradient-to-l from-gray-300 to-transparent pointer-events-none z-10" />
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="fixed pointer-events-none z-20 text-2xl"
            style={{
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: "translate(-50%, -50%)",
              transition: "opacity 0.1s linear",
            }}
          >
            {particle.emoji}
          </div>
        ))}
        {configuringIndex !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  const newEmojis = [...customEmojis];
                  newEmojis[configuringIndex] = {
                    emoji: emojiData.emoji,
                    isConfigured: true,
                  };
                  newEmojis.push({ emoji: "+", isConfigured: false });
                  setCustomEmojis(newEmojis);
                  setConfiguringIndex(null);
                }}
              />
            </div>
          </div>
        )}
        <h1 className="text-4xl font-bold text-center row-start-2 title rainbow-wave">
          <span>E</span>
          <span>x</span>
          <span>p</span>
          <span>l</span>
          <span>o</span>
          <span>d</span>
          <span>i</span>
          <span>e</span>
          <span>m</span>
          <span>o</span>
          <span>j</span>
          <span>i</span>
        </h1>
        <main className="flex flex-col gap-8 row-start-3 items-center justify-center w-full">
          <div className="flex flex-wrap gap-4 items-center justify-center max-w-[calc((48px+1rem)*10)]">
            {customEmojis.map((button, index) => (
              <div key={index} className="relative button-container">
                <button
                  onClick={(e) => handleCustomEmojiClick(index, e)}
                  className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] bg-gradient-to-b from-white via-white to-[#f5f5f5] dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 transition-all duration-200 flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 min-w-[48px] shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_2px_#fff] dark:shadow-[0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_1px_2px_#fff] dark:hover:shadow-[0_4px_12px_rgba(255,255,255,0.12),inset_0_1px_2px_rgba(255,255,255,0.1)] active:shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_2px_#fff] dark:active:shadow-[0_2px_4px_rgba(255,255,255,0.04),inset_0_1px_2px_rgba(255,255,255,0.1)] active:translate-y-[1px] hover:scale-110 hover:-translate-y-0.5 active:scale-105"
                >
                  {button.emoji}
                </button>
              </div>
            ))}
          </div>
        </main>
        {/* Credits */}
        <div className="fixed bottom-[60px] right-[60px] text-sm text-gray-500 dark:text-gray-400 flex flex-col items-end gap-2 z-20">
          <p>Created by Nathan Foote &lt;dispixel&gt;</p>
          <a
            href="https://ko-fi.com/dispixel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            ☕️ Buy me a coffee
          </a>
        </div>
        {/* Clear and Gravity buttons */}
        <div className="fixed bottom-[60px] left-[60px] flex gap-4 text-sm z-20">
          <button
            onClick={() => setParticles([])}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            [clear]
          </button>
          <button
            onClick={() => setGravityEnabled((prev) => !prev)}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            [gravity: {gravityEnabled ? "on" : "off"}]
          </button>
        </div>
      </div>
    </>
  );
}
