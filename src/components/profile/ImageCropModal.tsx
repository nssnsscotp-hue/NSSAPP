import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropSave: (croppedBase64: string) => void;
}

export default function ImageCropModal({ isOpen, imageSrc, onClose, onCropSave }: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const containerSize = 250; // Viewport is 250x250
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset state when new image source is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Calculate base dimensions of image inside viewport
  const getBaseDimensions = () => {
    if (!imgDimensions.width || !imgDimensions.height) {
      return { width: containerSize, height: containerSize };
    }
    const imgRatio = imgDimensions.width / imgDimensions.height;
    if (imgRatio > 1) {
      // Landscape: fit height, scale width
      return {
        width: containerSize * imgRatio,
        height: containerSize,
      };
    } else {
      // Portrait or Square: fit width, scale height
      return {
        width: containerSize,
        height: containerSize / imgRatio,
      };
    }
  };

  const base = getBaseDimensions();
  const displayW = base.width * zoom;
  const displayH = base.height * zoom;

  // Center alignment bounds initially
  const initialX = (containerSize - displayW) / 2;
  const initialY = (containerSize - displayH) / 2;

  const currentLeft = initialX + offset.x;
  const currentTop = initialY + offset.y;

  // Handle image load to parse raw scale ratios
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
  };

  // Drag handlers - Mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Drag handlers - Touch (mobile compatible)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset zoom & panning offset
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Render & export cropped square directly to Base64 (JPG)
  const handleApplyCrop = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = containerSize;
    canvas.height = containerSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get 2d render context for cropping canvas');
      return;
    }

    // Enable high quality rendering parameters
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, containerSize, containerSize);

    // Instantiate temporary Image object to prevent cross-site tainted canvas crashes
    const imgObj = new Image();
    imgObj.src = imageSrc;
    imgObj.onload = () => {
      // Draw image in canvas based on display coordinates mapped 
      ctx.drawImage(imgObj, currentLeft, currentTop, displayW, displayH);
      
      // Export at high quality
      const resultBase64 = canvas.toDataURL('image/jpeg', 0.85);
      onCropSave(resultBase64);
    };
    imgObj.onerror = (err) => {
      console.error('Error loading crop source', err);
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl z-10 p-6 flex flex-col items-center relative"
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/5 mb-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Position & Crop Photo</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Drag to position, slider to zoom</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Interactive view container */}
          <div className="relative select-none rounded-[1.5rem] border border-white/10 overflow-hidden bg-slate-950/50 shadow-inner flex items-center justify-center">
            <div
              className="relative overflow-hidden flex items-center justify-center cursor-move"
              style={{ width: containerSize, height: containerSize }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image Element */}
              <img
                ref={(el) => { imageRef.current = el; }}
                src={imageSrc}
                alt="Source to Crop"
                onLoad={handleImageLoaded}
                style={{
                  position: 'absolute',
                  left: currentLeft,
                  top: currentTop,
                  width: displayW,
                  height: displayH,
                  maxWidth: 'none',
                  pointerEvents: 'none'
                }}
                className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Viewport Mask and Framing Lines */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Circular Framing Border */}
                <div className="w-[180px] h-[180px] rounded-full border-2 border-dashed border-white/60 shadow-[0_0_0_100px_rgba(15,23,42,0.65)] flex items-center justify-center">
                  <div className="w-[180px] h-[180px] rounded-full border border-white/20" />
                </div>
              </div>

              {/* Visual guidance hints */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/85 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5 text-[8.5px] font-black text-slate-300 uppercase tracking-widest shadow-lg">
                <Move size={10} className="text-indigo-400" />
                <span>Drag inside circle</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full mt-6 space-y-4">
            {/* Zoom Slider */}
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
                <span className="flex items-center gap-1"><ZoomOut size={11} /> Scale Down</span>
                <span className="text-white font-mono">{Math.round(zoom * 100)}%</span>
                <span className="flex items-center gap-1">Zoom <ZoomIn size={11} /></span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Actions group */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="h-11 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all btn-tactile"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all btn-tactile"
              >
                <X size={13} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="h-11 bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 btn-tactile"
              >
                <Check size={13} />
                <span>Crop</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
