"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCw, Maximize2, Minimize2, RefreshCw, Box, AlertCircle } from "lucide-react";

interface ModelViewer3DProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function ModelViewer3D({
  src,
  alt,
  title,
  subtitle,
  className = "",
  onClose,
  isModal = false,
}: ModelViewer3DProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Dynamic import to prevent SSR issues with custom elements
    const loadScript = async () => {
      if (typeof window !== "undefined" && !customElements.get("model-viewer")) {
        try {
          await import("@google/model-viewer");
        } catch {
          // Fallback to CDN script if bundler resolution has edge cases
          const script = document.createElement("script");
          script.type = "module";
          script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
          document.head.appendChild(script);
        }
      }
    };
    loadScript();
  }, []);

  useEffect(() => {
    const el = modelViewerRef.current;
    if (!el) return;

    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ totalProgress: number }>;
      if (customEvent.detail && typeof customEvent.detail.totalProgress === "number") {
        setLoadProgress(Math.round(customEvent.detail.totalProgress * 100));
      }
    };

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadProgress(100);
    };

    const handleError = () => {
      setHasError(true);
    };

    el.addEventListener("progress", handleProgress);
    el.addEventListener("load", handleLoad);
    el.addEventListener("error", handleError);

    return () => {
      el.removeEventListener("progress", handleProgress);
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("error", handleError);
    };
  }, [src]);

  const toggleAutoRotate = () => {
    const el = modelViewerRef.current;
    if (el) {
      if (autoRotate) {
        el.removeAttribute("auto-rotate");
      } else {
        el.setAttribute("auto-rotate", "");
      }
      setAutoRotate(!autoRotate);
    }
  };

  const handleResetCamera = () => {
    const el = modelViewerRef.current as (HTMLElement & { resetTurntable?: () => void; cameraOrbit?: string }) | null;
    if (el) {
      el.setAttribute("camera-orbit", "0deg 75deg 105%");
      if (typeof el.resetTurntable === "function") {
        el.resetTurntable();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden bg-[#f8f9fa] text-[#1E2024] border border-[#E3E6EB] shadow-lg flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none w-screen h-screen bg-[#f8f9fa]" : className
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#E3E6EB] z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F2F7EC] text-[#76A733] border border-[#76A733]/30 flex items-center justify-center">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wide uppercase text-[#1E2024]">
              {title || "Model 3D Interaktif"}
            </h4>
            <p className="text-[11px] text-[#70757D] -mt-0.5 font-medium">
              {subtitle || "Geser untuk rotasi 360° • Scroll untuk zoom"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={autoRotate ? "Jeda Rotasi Otomatis" : "Mulai Rotasi Otomatis"}
            className={`p-2 rounded-xl text-xs transition border ${
              autoRotate
                ? "bg-[#76A733] text-white border-[#5E8826] shadow-xs"
                : "bg-white hover:bg-[#F4F5F7] text-[#70757D] border-[#E3E6EB]"
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            title="Reset Posisi Kamera"
            className="p-2 rounded-xl text-xs bg-white hover:bg-[#F4F5F7] text-[#70757D] border border-[#E3E6EB] transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            className="p-2 rounded-xl text-xs bg-white hover:bg-[#F4F5F7] text-[#70757D] border border-[#E3E6EB] transition shadow-xs"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#424242] hover:bg-[#1E2024] text-white transition"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Area with #f8f9fa background */}
      <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[460px] bg-[#f8f9fa]">
        {/* Loading Overlay */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#f8f9fa]/90 backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl border-2 border-[#76A733] border-t-[#D4C4B1] animate-spin" />
            <p className="text-xs font-semibold text-[#1E2024]">Memuat Model 3D...</p>
            <div className="w-48 h-1.5 bg-[#E3E6EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#76A733] to-[#BDA58B] transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#5E8826] font-semibold">{loadProgress}%</span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <p className="text-xs font-semibold text-[#1E2024]">Gagal merender model 3D</p>
            <p className="text-[11px] text-[#70757D] max-w-sm">
              Pastikan browser mendukung WebGL atau coba muat ulang halaman.
            </p>
          </div>
        )}

        {/* Custom Element model-viewer via React.createElement with #f8f9fa background */}
        {typeof window !== "undefined" &&
          React.createElement("model-viewer", {
            ref: modelViewerRef,
            src: src,
            alt: alt,
            "camera-controls": "",
            "auto-rotate": autoRotate ? "" : undefined,
            "rotation-per-second": "25deg",
            "shadow-intensity": "1.0",
            "shadow-softness": "0.9",
            exposure: "1.08",
            "touch-action": "pan-y",
            style: {
              width: "100%",
              height: "100%",
              minHeight: "380px",
              backgroundColor: "#f8f9fa",
            },
          })}

        {/* Navigation hint pill at bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E3E6EB] shadow-xs text-[11px] text-[#424242] flex items-center gap-2 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#76A733] animate-pulse" />
          <span>Sentuh / Klik &amp; Tarik untuk kelilingi kamar</span>
        </div>
      </div>
    </div>
  );
}
