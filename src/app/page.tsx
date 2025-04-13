"use client";

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Background from "@/components/background";
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
    setCreateNickname(e.target.value.toUpperCase().slice(0, 7));
  };

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value.toUpperCase());
  };

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value.toUpperCase().slice(0, 7));
    };

    const iconStyle = {
        position: 'absolute',
        opacity: 0.3,
    };

    const generateIconStyle = (x: number, y: number, rotation: number, fontSize: number) => ({
        ...iconStyle,
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${fontSize}px`,
        transform: `rotate(${rotation}deg)`,
    });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted p-4 overflow-hidden">
      {/* Background Icons */}
        <Background regenerateOnChange={createNickname + joinCode + nickname} />

      <h1 className="text-4xl font-bold mb-8 relative">Drawing Roguelike</h1>

      <div className="flex w-full max-w-2xl space-x-8 relative">
        {/* Create New Game Section */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Create New Game</h2>
          <form onSubmit={handleCreateNewGame} className="flex flex-col items-center space-y-2">
            <Input
              type="text"
              placeholder="Enter Nickname"
              value={createNickname}
              onChange={handleCreateNicknameChange}
              className="w-full max-w-xs"
              maxLength={7}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission
                  handleCreateNewGame();
                }
              }}
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
          </form>
        </div>

        {/* Join Game Section */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Join Game</h2>
          <form onSubmit={handleJoinGame} className="flex flex-col items-center space-y-2">
            <Input
              type="text"
              placeholder="Enter Lobby Code"
              value={joinCode}
              onChange={handleJoinCodeChange}
              className="w-full max-w-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission
                  handleJoinGame();
                }
              }}
            />
            <Input
              type="text"
              placeholder="Enter Nickname"
              value={nickname}
              onChange={handleNicknameChange}
              className="w-full max-w-xs"
              maxLength={7}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission
                  handleJoinGame();
                }
              }}
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
          </form>
        </div>
      </div>
    </div>
  );
}


