'use client';

import React, { useState, useRef, useEffect } from 'react';

interface WordArtProps {
  onImageGenerated: (base64: string) => void;
  className?: string;
}

const FONTS = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
];

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#000080', '#808080', '#C0C0C0', '#800000',
];

export const WordArt: React.FC<WordArtProps> = ({
  onImageGenerated,
  className = "",
}) => {
  const [text, setText] = useState('');
  const [font, setFont] = useState(FONTS[0].value);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [lineHeight, setLineHeight] = useState(1.2);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = () => {
    if (!text.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 256;
    canvas.height = 256;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Split text into lines
    const lines = text.split('\n');
    
    // Calculate font size to fit text
    let fontSize = 48;
    ctx.font = `${fontSize}px ${font}`;
    
    // Find the longest line for width calculation
    const longestLine = lines.reduce((longest, line) => 
      line.length > longest.length ? line : longest, '');
    
    // Adjust font size to fit width
    while (fontSize > 12 && ctx.measureText(longestLine).width > canvas.width - 20) {
      fontSize -= 2;
      ctx.font = `${fontSize}px ${font}`;
    }

    // Adjust font size to fit height
    const totalHeight = lines.length * fontSize * lineHeight;
    while (fontSize > 12 && totalHeight > canvas.height - 20) {
      fontSize -= 2;
      ctx.font = `${fontSize}px ${font}`;
    }

    // Draw text lines
    const startY = canvas.height / 2 - ((lines.length - 1) * fontSize * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      const y = startY + index * fontSize * lineHeight;
      ctx.fillText(line.trim(), canvas.width / 2, y);
    });

    // Convert to base64
    const base64 = canvas.toDataURL();
    setPreview(base64);
  };

  const handleGenerate = () => {
    generateImage();
    if (preview) {
      onImageGenerated(preview);
    }
  };

  useEffect(() => {
    if (text.trim()) {
      generateImage();
    } else {
      setPreview(null);
    }
  }, [text, font, textColor, backgroundColor, lineHeight]);

  return (
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text here...&#10;You can use multiple lines"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {FONTS.map((fontOption) => (
                <option key={fontOption.value} value={fontOption.value}>
                  {fontOption.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTextColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      textColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBackgroundColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      backgroundColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Height: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {preview && (
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Use This WordArt
            </button>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[256px] flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="WordArt Preview"
                className="max-w-full max-h-64 rounded border bg-white"
              />
            ) : (
              <div className="text-gray-500 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4V3h10v5M7 8v12h10V8M7 8H6a1 1 0 00-1 1v10a1 1 0 001 1h1m0-12h10m-10 0V8m10 0v12H7V8"
                  />
                </svg>
                Enter text to see preview
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={256}
        height={256}
      />
    </div>
  );
};
