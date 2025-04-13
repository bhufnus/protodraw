"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, RefreshCw, Settings, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Background from "@/components/background";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const colors = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#C0C0C0",
  "#808080",
];

const drawingPrompts = [
  "Car",
  "House",
  "Tree",
  "Sun",
  "Moon",
  "Star",
  "Cloud",
  "Flower",
  "Dog",
  "Cat",
  "Fish",
  "Bird",
  "Book",
  "Chair",
  "Table",
  "Phone",
  "Computer",
  "Shoes",
  "Hat",
  "Ball",
];

const MAX_INK = 100;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const [inkLevel, setInkLevel] = useState(MAX_INK);
  const [drawingPrompt, setDrawingPrompt] = useState("");
  const [guess, setGuess] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [inkDepletionSpeed, setInkDepletionSpeed] = useState(0.115);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [randomizeColor, setRandomizeColor] = useState(false);
  const [isDrawer, setIsDrawer] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const lobbyCode = searchParams.get('lobby') || "";
  const nickname = searchParams.get('nickname') || "Guest";

  const [previousColor, setPreviousColor] = useState("#000000");
  const [connectedUsers, setConnectedUsers] = useState([nickname]);
  const [isInkIntermittent, setIsInkIntermittent] = useState(false);
  const [isInkOn, setIsInkOn] = useState(true);
  const inkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isInkReductionOn, setIsInkReductionOn] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    const canvasWidthCalc = window.innerWidth * 0.7 * 0.85;
    const canvasHeight = window.innerHeight * 0.7;
    const squareSize = Math.min(canvasWidthCalc, canvasHeight) * 0.7;
    canvas.width = squareSize;

    canvas.height = squareSize;

    setCanvasWidth(squareSize);

    // Set default styles
    context.lineCap = "round";
    context.fillStyle = "#FFFFFF"; // Set canvas background color
    context.fillRect(0, 0, canvas.width, canvas.height); // Apply background color

    context.strokeStyle = selectedColor;
    context.lineWidth = brushSize;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.strokeStyle = selectedColor;
    context.lineWidth = brushSize;
  }, [selectedColor, brushSize]);

  useEffect(() => {
    // Only set the drawing prompt on the client side
    setDrawingPrompt(
      drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)]
    );
  }, []);

  useEffect(() => {
    if (isDrawing && isInkIntermittent) {
      inkIntervalRef.current = setInterval(() => {
        setIsInkOn((prev) => !prev);
      }, 50);
    } else {
      if (inkIntervalRef.current) {
        clearInterval(inkIntervalRef.current);
        inkIntervalRef.current = null;
      }
      setIsInkOn(true);
    }
    return () => {
      if (inkIntervalRef.current) {
        clearInterval(inkIntervalRef.current);
      }
    };
  }, [isDrawing, isInkIntermittent]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (inkLevel <= 0) {
      toast({
        title: "Out of Ink!",
        description: "Refill your ink to continue drawing.",
      });
      return;
    }

    setIsDrawing(true);
    lastX.current = e.nativeEvent.offsetX;
    lastY.current = e.nativeEvent.offsetY;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.beginPath();
    context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (randomizeColor) {
      let newColor;
      do {
        newColor = colors[Math.floor(Math.random() * colors.length)];
      } while (newColor === previousColor); // Ensure it's not the same as the last color

      setSelectedColor(newColor);
      setPreviousColor(newColor);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (inkLevel <= 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (isInkOn) {
      context.lineTo(x, y);
      context.stroke();

      if (mirrorMode) {
        // Calculate the mirrored coordinates
        const mirroredX = canvas.width - x;

        // Draw on the mirrored side
        context.beginPath();
        context.moveTo(mirroredX, y);
        context.lineTo(
          canvas.width - e.nativeEvent.offsetX,
          e.nativeEvent.offsetY
        );
        context.stroke();
      }
    } else {
      context.beginPath(); // Start a new path to prevent connecting lines
      context.moveTo(x, y);
    }

    let inkReduction = inkDepletionSpeed;
    if (isInkReductionOn) {
      inkReduction += (MAX_INK * 0.2) / MAX_INK; // Reduce by 20%
    }

    setInkLevel((prevInk) => Math.max(0, prevInk - inkReduction));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#FFFFFF"; // Set canvas background color
    context.fillRect(0, 0, canvas.width, canvas.height); // Apply background color
    context.beginPath();
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "drawing.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Drawing Downloaded!",
      description: "Your drawing has been saved as drawing.png",
    });
  };

  const refillInk = () => {
    setInkLevel(MAX_INK);
    toast({
      title: "Ink Refilled!",
      description: "Your ink has been refilled to maximum.",
    });
  };

  const generateNewPrompt = () => {
    clearCanvas();
    setSelectedColor(colors[Math.floor(Math.random() * colors.length)]);
    setDrawingPrompt(
      drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)]
    );
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedGuess = guess.trim();
    if (trimmedGuess === "") {
      toast({
        title: "Empty Guess",
        description: "Please enter a guess.",
      });
    } else {
      if (trimmedGuess.toUpperCase() === drawingPrompt.toUpperCase()) {
        toast({
          title: "Correct!",
          description: "You guessed the prompt!",
        });
        generateNewPrompt();
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          `${nickname} guessed the prompt!`,
        ]);
      } else {
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          `${nickname} guessed ${trimmedGuess.toUpperCase()}`,
        ]);
        toast({
          title: "Incorrect",
          description: "Try again!",
        });
      }
      setGuess("");
    }
  };

  const toggleIsDrawer = () => {
    setIsDrawer((prev) => !prev);
  };

  return (
    <> <div className="flex min-h-screen bg-muted relative overflow-hidden">
      <Background regenerateOnChange={drawingPrompt + guess} style={{ zIndex: 0 }} />
      <Toaster />

      {/* Lobby Code Display */}    
      <div className="absolute bottom-4 left-4">
        <h2 className="text-lg font-bold text-red-800">{lobbyCode}</h2>
      </div>

     
      

      <div
        className="w-1/4 p-4 flex flex-col bg-secondary rounded-md" style={{ zIndex: 2 }}
      >
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="w-full mt-2"
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <h2 className="text-lg font-bold mb-4">Drawing Tools</h2>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mt-1">
            Ink Level: {inkLevel.toFixed(1)} / {MAX_INK}
          </p>
          <Progress
            value={inkLevel}
            className="mb-2"
            style={{
              "--radix-progress-indicator-transform": `translateX(-${
                100 - (inkLevel || 0)
              }%)`,
            }}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="brushSize" className="block text-sm font-medium">
            Brush Size:
          </label>
          <Slider
            id="brushSize"
            defaultValue={[brushSize]}
            max={20}
            min={1}
            step={1}
            onValueChange={(value) => setBrushSize(value[0])}
          />
        </div>

        <div className="mb-4">
          <p className="block text-sm font-medium">Colors:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color
                    ? "border-teal-500"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={() => setDevToolsOpen(!devToolsOpen)}
          className="w-full"
        >
          <Settings className="mr-2 h-4 w-4" />
          Dev Tools
        </Button>

      {devToolsOpen && (
          <>
            <Button
              variant="secondary"
              onClick={refillInk}
              disabled={inkLevel === MAX_INK}
              className="w-full mt-2"
            >
              Refill Ink
            </Button>

            <div className="mb-4">
              <label
                htmlFor="inkDepletionSpeed"
                className="block text-sm font-medium"
              >
                Ink Speed:
              </label>
              <Input
                type="number"
                id="inkDepletionSpeed"
                value={inkDepletionSpeed}
                onChange={(e) =>
                  setInkDepletionSpeed(parseFloat(e.target.value))
                }
                className="w-full"
                step="0.001"
              />
            </div>

            <div className="mb-4">
              <p className="block text-sm font-medium">Modifiers:</p>
              <label className="inline-flex items-center cursor-pointer">
                <Input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-teal-500"
                  checked={randomizeColor}
                  onChange={() => setRandomizeColor(!randomizeColor)}
                />
                <span className="ml-2 text-gray-700">
                  Randomize Color on New Line
                </span>
              </label>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <Input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-teal-500"
                  checked={isInkIntermittent}
                  onChange={() => setIsInkIntermittent(!isInkIntermittent)}
                />
                <span className="ml-2 text-gray-700">Intermittent Ink</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <Input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-teal-500"
                  checked={isInkReductionOn}
                  onChange={() => setIsInkReductionOn(!isInkReductionOn)}
                />
                <span className="ml-2 text-gray-700">Ink Reduction</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <Input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-teal-500"
                  checked={mirrorMode}
                  onChange={() => setMirrorMode(!mirrorMode)}
                />
                <span className="ml-2 text-gray-700">Mirror Mode</span>
              </label>
            </div>

          </>
        
          )}
          {devToolsOpen && (
                <label className="inline-flex items-center cursor-pointer">
              <Input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-teal-500"
                checked={isDrawer}
                onChange={toggleIsDrawer}
              />
                    <span className="ml-2 text-gray-700">Drawer Mode</span>
              </label>
          )}

            <Button
          variant="secondary"
          onClick={clearCanvas}
              className="w-full mt-2"
          >
              <RefreshCw className="mr-2 h-4 w-4" />
          Clear Canvas
          </Button>
        <Button
          variant="secondary"
          onClick={downloadDrawing}
          className="w-full mt-2"
        >
              <Download className="mr-2 h-4 w-4" />

          Download
            </Button>
      </div>

     
      {/* Right Side - Canvas and Chat */}
      <div className="w-3/4 flex flex-col items-center p-4">
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Connected Users</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {connectedUsers?.map((user, index) => (
                <DropdownMenuItem key={index}>{user}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
          <canvas
              ref={canvasRef}
              className="border-2 border-gray-400 rounded-md shadow-md cursor-crosshair bg-white mt-4"
              style={{ zIndex: 1 }}
              {...(isDrawer && {
                  onMouseDown: startDrawing,
                  onMouseUp: endDrawing,
                  onMouseMove: draw,
                  onMouseLeave: endDrawing
              })}> </canvas>
        <h3>Nickname: {nickname}</h3>
        <h1 className="text-2xl font-bold mb-2">
          {isDrawer ? `Draw: ${drawingPrompt}` : "Guess what they are drawing"}
        </h1>

          {!isDrawer && (
            <form
              style={{ width: canvasWidth }}
              onSubmit={handleGuessSubmit}
              className="flex mt-2 w-full max-w-[calc(min(calc(100vw * 0.7 * 0.85), calc(100vh * 0.7)))]"            
            >
              <Input
                type="text"
                placeholder="Guess the drawing!"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="mr-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGuessSubmit(e);
                  }
                }}
              />
              <Button type="submit">Guess!</Button>
            </form>
        )}
        {!isDrawer && (
          <div
            style={{ width: canvasWidth }}
            className="h-48 overflow-y-auto p-2 border rounded mt-2 w-full max-w-[calc(min(calc(100vw * 0.7 * 0.85), calc(100vh * 0.7)))]"
          >
            {chatLog.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        )}
          
      </div>
    </div></>
  );
}
