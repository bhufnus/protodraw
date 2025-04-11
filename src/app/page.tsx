"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

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
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
      <Toaster />
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 ${
              selectedColor === color ? "border-teal-500" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4">
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

      <canvas
        ref={canvasRef}
        className="border-2 border-gray-400 rounded-md shadow-md cursor-crosshair bg-white"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={endDrawing}
      ></canvas>

      <div className="flex justify-center gap-4 mt-4">
        <Button variant="secondary" onClick={clearCanvas}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear Canvas
        </Button>
        <Button variant="secondary" onClick={downloadDrawing}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
