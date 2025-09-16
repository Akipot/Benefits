import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  show: boolean;
  onClose: () => void;
}

export default function ImagePreview({ src, alt = "Image", show, onClose }: ImagePreviewProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10); // trigger entrance animation
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300); // wait for exit animation
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 transition-opacity duration-300
        ${animate ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded shadow-lg max-w-[90%] max-h-[90%] transform transition-all duration-300
    ${animate ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/70 dark:bg-gray-700/70 rounded-full p-2 hover:bg-white/90 dark:hover:bg-gray-700/90 text-gray-800 dark:text-gray-200 transition shadow-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded"
        />
      </div>

    </div>
  );
}
