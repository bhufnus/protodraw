"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, RefreshCw, Settings, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useRouter, useSearchParams } from "next/navigation";

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
  const [inkDepletionSpeed, setInkDepletionSpeed] = useState(0.115);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [randomizeColor, setRandomizeColor] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const lobbyCode = searchParams.get('lobby');
  const nickname = searchParams.get('nickname') || 'Guest';

  const [previousColor, setPreviousColor] = useState("#000000");
  const [connectedUsers, setConnectedUsers] = useState([nickname]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth * 0.7 * 0.7;
    canvas.height = window.innerHeight * 0.7;

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

    context.lineTo(x, y);
    context.stroke();

    lastX.current = x;
    lastY.current = y;

    setInkLevel((prevInk) => Math.max(0, prevInk - inkDepletionSpeed)); // Reduce ink level faster
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
    if (guess.trim().toLowerCase() === drawingPrompt.toLowerCase()) {
      toast({
        title: "Correct!",
        description: "You guessed the prompt!",
      });
      generateNewPrompt();
      clearCanvas();
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
      });
    }
    setGuess("");
  };

  return (
    <div className="flex min-h-screen bg-muted">
      <Toaster />

      {/* Left Sidebar - Drawing Tools */}
      <div className="w-1/4 p-4 flex flex-col bg-secondary rounded-md" style={{ backgroundColor: 'hsl(var(--secondary))' }}>
        <Button variant="secondary" onClick={() => router.push('/')} className="w-full mt-2">
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
              background: "white",
              "--radix-progress-indicator-transform": `translateX(-${100 - (inkLevel || 0)}%)`,
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
                className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? "border-teal-500" : "border-transparent"
                  }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <Button onClick={() => setDevToolsOpen(!devToolsOpen)} className="w-full">
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
              <label htmlFor="inkDepletionSpeed" className="block text-sm font-medium">
                Ink Speed:
              </label>
              <Input
                type="number"
                id="inkDepletionSpeed"
                value={inkDepletionSpeed}
                onChange={(e) => setInkDepletionSpeed(parseFloat(e.target.value))}
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
                <span className="ml-2 text-gray-700">Randomize Color on New Line</span>
              </label>
            </div>

            <Button variant="secondary" onClick={generateNewPrompt} className="w-full mt-2">
              New Prompt
            </Button>
          </>
        )}

        <Button variant="secondary" onClick={clearCanvas} className="w-full mt-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear Canvas
        </Button>
        <Button variant="secondary" onClick={downloadDrawing} className="w-full mt-2">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Right Side - Canvas and Chat */}
      <div className="w-3/4 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Draw: {drawingPrompt}</h1>
        <h2>Lobby: {lobbyCode}</h2>
        <h3>Nickname: {nickname}</h3>
        <div>
          Connected Users:
          <ul>
            {connectedUsers?.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </div>

        <canvas
          ref={canvasRef}
          className="border-2 border-gray-400 rounded-md shadow-md cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          onMouseLeave={endDrawing}
        ></canvas>

        <form onSubmit={handleGuessSubmit} className="flex mt-2 w-full max-w-md">
          <Input
            type="text"
            placeholder="Guess the drawing!"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="mr-2"
          />
          <Button type="submit">Guess!</Button>
        </form>
      </div>
    </div>
  );
}



