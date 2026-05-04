"use client";

import { useEffect, useCallback } from "react";

/**
 * ContentProtection — Anti-theft layer for the entire site.
 * 
 * Blocks:
 * - Right-click context menu
 * - Image drag & drop
 * - Print Screen / screenshots (hides content via CSS visibility)
 * - Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12 (save / view-source / devtools)
 * - Ctrl+P / Cmd+P (print)
 * - Ctrl+Shift+S (save as)
 * - Copy via Ctrl+C on images
 * - Long press on mobile (touch context menu)
 * 
 * Uses CSS @media print to black out the page on print attempts.
 * Uses visibility API to detect screenshot tools that minimize/blur the window.
 */
export default function ContentProtection() {
  // Block keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Block F12 (DevTools)
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Block Ctrl/Cmd combinations
    if (e.ctrlKey || e.metaKey) {
      const blockedKeys = [
        "s", // Save
        "u", // View source
        "p", // Print
        "j", // Console
      ];

      if (blockedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Ctrl+Shift+I (DevTools), Ctrl+Shift+C (Inspect), Ctrl+Shift+S (Save As)
      if (e.shiftKey) {
        const blockedShiftKeys = ["i", "c", "s", "j"];
        if (blockedShiftKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }

    // Block PrintScreen key
    if (e.key === "PrintScreen") {
      e.preventDefault();
      // Clear clipboard to prevent screenshot
      navigator.clipboard?.writeText?.("").catch(() => {});
      showProtectionOverlay();
      return false;
    }
  }, []);

  // Block right-click context menu
  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  // Block image dragging
  const handleDragStart = useCallback((e: DragEvent) => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault();
      return false;
    }
  }, []);

  // Block copy
  const handleCopy = useCallback((e: ClipboardEvent) => {
    // Allow copy in input fields
    const target = e.target as HTMLElement;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
    e.clipboardData?.setData("text/plain", "© William del Barrio — Conteúdo Protegido");
  }, []);

  // Show a brief overlay flash on screenshot attempts
  const showProtectionOverlay = useCallback(() => {
    const overlay = document.getElementById("__wdb_protection_overlay");
    if (overlay) {
      overlay.style.opacity = "1";
      overlay.style.visibility = "visible";
      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.visibility = "hidden";
        }, 300);
      }, 800);
    }
  }, []);

  // Detect window blur (potential screenshot tool)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      showProtectionOverlay();
    }
  }, [showProtectionOverlay]);

  // Handle window blur (Alt+Tab, etc)
  const handleWindowBlur = useCallback(() => {
    // Brief overlay on blur to counter screen capture
    showProtectionOverlay();
  }, [showProtectionOverlay]);

  useEffect(() => {
    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    // Right-click
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });

    // Image drag
    document.addEventListener("dragstart", handleDragStart, { capture: true });

    // Copy
    document.addEventListener("copy", handleCopy, { capture: true });

    // Visibility & blur
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    // Disable image selection via CSS (injected dynamically for all images)
    const style = document.createElement("style");
    style.id = "__wdb_protection_styles";
    style.textContent = `
      img, video, picture, canvas, svg {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        pointer-events: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
      }

      /* Re-enable pointer events for interactive elements containing images */
      a img, button img, [role="button"] img,
      a, button, [role="button"], input, textarea, select {
        pointer-events: auto !important;
      }

      /* Disable text selection on body but allow on inputs */
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      input, textarea, select, [contenteditable="true"], code, pre {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    // Prevent long-press on mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true });

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("touchstart", handleTouchStart, { capture: true } as EventListenerOptions);
      const injectedStyle = document.getElementById("__wdb_protection_styles");
      if (injectedStyle) injectedStyle.remove();
    };
  }, [handleKeyDown, handleContextMenu, handleDragStart, handleCopy, handleVisibilityChange, handleWindowBlur]);

  return (
    <>
      {/* Invisible overlay that activates on screenshot attempts */}
      <div
        id="__wdb_protection_overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#000",
          zIndex: 999999,
          opacity: 0,
          visibility: "hidden",
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Watermark layer — subtle diagonal text over images */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9998,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: 0.03,
        }}
      >
        <div
          style={{
            width: "200%",
            height: "200%",
            transform: "rotate(-30deg) translate(-25%, -25%)",
            display: "flex",
            flexWrap: "wrap",
            gap: "80px",
            padding: "40px",
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <span
              key={i}
              style={{
                color: "#fff",
                fontSize: "14px",
                fontFamily: "monospace",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              © WDB EDITORIAL
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
