"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

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
  "Cat",
  "Cityscape",
  "Forest",
  "Explosion",
  "Portrait",
  "Mountain",
  "River",
  "House",
  "Tree",
  "Car",
];

const MAX_INK = 100;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const [inkLevel, setInkLevel] = useState(MAX_INK);
  const [drawingPrompt, setDrawingPrompt] = useState(
    drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)]
  );

  const [guess, setGuess] = useState("");
  const [inkDepletionSpeed, setInkDepletionSpeed] = useState(0.115);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth * 0.8;
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2">Draw: {drawingPrompt}</h1>

      <div className="flex items-center space-x-4 mb-2">
        <Button variant="secondary" onClick={generateNewPrompt}>
          New Prompt
        </Button>
        <Button variant="secondary" onClick={refillInk} disabled={inkLevel === MAX_INK}>
          Refill Ink
        </Button>
        <Button variant="secondary" onClick={downloadDrawing}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="mb-2 w-full max-w-md">
        <Progress value={inkLevel} />
        <p className="text-sm text-muted-foreground mt-1">Ink Level: {inkLevel.toFixed(1)} / {MAX_INK}</p>
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <label htmlFor="inkDepletionSpeed" className="text-sm font-medium">
          Ink Speed:
        </label>
        <Input
          type="number"
          id="inkDepletionSpeed"
          value={inkDepletionSpeed}
          onChange={(e) => setInkDepletionSpeed(parseFloat(e.target.value))}
          className="w-20"
          step="0.001"
        />
        <label htmlFor="brushSize" className="text-sm font-medium">
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

      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 ${
              selectedColor === color ? "border-teal-500" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
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
      <Button variant="secondary" onClick={clearCanvas}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Clear Canvas
      </Button>
    </div>
  );
}
