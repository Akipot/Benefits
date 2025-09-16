import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
  getData: () => string;
  getDataForPDF: () => Promise<string>;
}

interface SignaturePadProps {
  className?: string;
  onEnd?: (data: string) => void;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ className, onEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const getIsDark = () => document.documentElement.classList.contains("dark");

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = width * 0.4;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(ratio, ratio);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = getIsDark() ? "#ffffff" : "#181818ff";
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create 2D context once with willReadFrequently
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctxRef.current = ctx;

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const observer = new MutationObserver(resizeCanvas);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        observer.disconnect();
      };
    }, []);

    const getPos = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      if ("touches" in e && e.touches.length > 0) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      } else if ("clientX" in e) {
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
      return { x: 0, y: 0 };
    };

    const startDrawing = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      const pos = getPos(e);
      lastPosRef.current = pos;
      setIsDrawing(true);
      const ctx = ctxRef.current;
      ctx?.beginPath();
      ctx?.moveTo(pos.x, pos.y);
    };

    const draw = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      e.preventDefault();
      if (!isDrawing || !lastPosRef.current) return;
      const pos = getPos(e);
      const ctx = ctxRef.current;
      if (!ctx) return;

      const midX = (lastPosRef.current.x + pos.x) / 2;
      const midY = (lastPosRef.current.y + pos.y) / 2;
      ctx.quadraticCurveTo(lastPosRef.current.x, lastPosRef.current.y, midX, midY);
      ctx.stroke();
      lastPosRef.current = pos;
    };

    const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
      e?.preventDefault();
      setIsDrawing(false);
      lastPosRef.current = null;
      if (onEnd) onEnd(getData());
    };

    const clear = () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      // Reset transform before clearing
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Reapply the scale after clearing
      const ratio = window.devicePixelRatio || 1;
      ctx.scale(ratio, ratio);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = getIsDark() ? "#ffffff" : "#181818ff";
    };

    const isEmpty = () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return true;
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] !== 0) return false;
      }
      return true;
    };

    const toDataURL = () => {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL("image/png") : "";
    };

    const getData = () => toDataURL();

    const getDataForPDF = (): Promise<string> => {
      const canvas = canvasRef.current;
      if (!canvas) return Promise.resolve("");

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      const img = new Image();
      img.src = canvas.toDataURL("image/png");

      return new Promise<string>((resolve) => {
        img.onload = () => {
          tempCtx.drawImage(img, 0, 0);
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
              data[i] = 0;
              data[i + 1] = 0;
              data[i + 2] = 0;
            }
          }
          tempCtx.putImageData(imageData, 0, 0);
          resolve(tempCanvas.toDataURL("image/png"));
        };
      });
    };

    useImperativeHandle(ref, () => ({
      clear,
      isEmpty,
      toDataURL,
      getData,
      getDataForPDF,
    }));

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ touchAction: "none", userSelect: "none" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onContextMenu={(e) => e.preventDefault()}
      />
    );
  }
);

export default SignaturePad;
