"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brush, Circle, Square, Palette } from 'lucide-react'; // Import icons
import React from 'react';

function generateGameCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [createNickname, setCreateNickname] = useState('');
  const [backgroundIcons, setBackgroundIcons] = useState([]);

  const generateIcons = useCallback(() => {
    const newIcons = [...Array(20)].map((_, index) => {
      const size = Math.floor(Math.random() * 30) + 20; // Random size between 20 and 50
      const x = Math.floor(Math.random() * 100); // Random position
      const y = Math.floor(Math.random() * 100);
      const rotation = Math.floor(Math.random() * 360); // Random rotation
      const iconType = Math.floor(Math.random() * 4); // Randomly select icon

      let animation = '';
      switch (iconType) {
        case 0: // Brush - Horizontal drift
          animation = 'drift-left 10s linear infinite';
          break;
        case 2: // Circle - Horizontal drift
          animation = 'drift 10s linear infinite';
          break;
        case 1: // Palette - Spin
            animation = Math.random() < 0.5 ? 'spin-clockwise 15s linear infinite' : 'spin-counterclockwise 15s linear infinite';
            break;
          case 3: // Square - Falling
            animation = 'fall 15s linear infinite';
            break;
        default:
          animation = '';
          break;
      }


      return {
        key: index,
        size,
        x,
        y,
        rotation,
        iconType,
        animation,
      };
    });
    setBackgroundIcons(newIcons);
  }, []);

  useEffect(() => {
    generateIcons();
  }, [generateIcons]);

  const handleCreateNewGame = () => {
    setIsLoading(true);
    const newGameCode = generateGameCode(7);
    router.push(`/waiting-room?lobby=${newGameCode}&nickname=${createNickname}`);
  };

  const handleJoinGame = () => {
    setIsLoading(true);
    router.push(`/game?lobby=${joinCode}&nickname=${nickname}`);
  };

  const handleCreateNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateNickname(e.target.value);
    generateIcons(); // Regenerate icons on nickname change
  };

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value);
    generateIcons(); // Regenerate icons on join code change
  };

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
        generateIcons(); // Regenerate icons on nickname change
    };

    const IconComponents = useMemo(() => ({
        0: Brush,
        1: Palette,
        2: Circle,
        3: Square,
    }), []);

    const MemoizedIcon = React.memo(function Icon({ icon, size, x, y, rotation, animation, id }: {
        icon: number;
        size: number;
        x: number;
        y: number;
        rotation: number;
        animation: string;
        id: React.Key;
    }) {
        const IconComponent = IconComponents[icon] || Square;
        let className = "";

        switch (icon) {
            case 0:
                className = "text-red-500";
                break;
            case 1:
                className = "text-green-500";
                break;
            case 2:
                className = "text-blue-500";
                break;
            default:
                className = "text-yellow-500";
        }

        return (
            <span
                key={id}
                className="absolute opacity-30"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    fontSize: `${size}px`,
                    transform: `rotate(${rotation}deg)`,
                    animation: animation,
                }}
            >
                <IconComponent className={className} />
            </span>
        );
    });


  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted p-4 overflow-hidden">
      {/* Background Icons */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {backgroundIcons.map((icon, index) => {
          return (
            <MemoizedIcon
              key={icon.key}
              id={icon.key}
              icon={icon.iconType}
              size={icon.size}
              x={icon.x}
              y={icon.y}
              rotation={icon.rotation}
              animation={icon.animation}
            />
          );
        })}
      </div>


      <h1 className="text-4xl font-bold mb-8 relative">Drawing Roguelike</h1>

      <div className="flex w-full max-w-2xl space-x-8 relative">
        {/* Create New Game Section */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Create New Game</h2>
          <div className="flex flex-col items-center space-y-2">
            <Input
              type="text"
              placeholder="Enter Nickname"
              value={createNickname}
              onChange={handleCreateNicknameChange}
              className="w-full max-w-xs"
            />
            <Button
              className="rounded-md px-4 py-2 hover:bg-primary/80 disabled:bg-primary/50 flex items-center justify-center"
              style={{backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))'}}
              onClick={handleCreateNewGame}
              disabled={isLoading || createNickname.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Game...
                </>
              ) : (
                "Create New Game"
              )}
            </Button>
          </div>
        </div>

        {/* Join Game Section */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Join Game</h2>
          <div className="flex flex-col items-center space-y-2">
            <Input
              type="text"
              placeholder="Enter Lobby Code"
              value={joinCode}
              onChange={handleJoinCodeChange}
              className="w-full max-w-xs"
            />
            <Input
              type="text"
              placeholder="Enter Nickname"
              value={nickname}
              onChange={handleNicknameChange}
              className="w-full max-w-xs"
            />
            <Button
              className="rounded-md px-4 py-2 hover:bg-secondary/80 disabled:bg-secondary/50"
              style={{backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))'}}
              onClick={handleJoinGame}
              disabled={isLoading || joinCode.length !== 7 || nickname.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Game...
                </>
              ) : (
                "Join Game"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
