"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Estado global para manejar un solo tooltip abierto a la vez
let activeTooltipId: string | null = null;
const tooltipCallbacks: Map<string, () => void> = new Map();

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Registrar callback para cerrar este tooltip
    tooltipCallbacks.set(tooltipId.current, () => setIsVisible(false));
    
    return () => {
      tooltipCallbacks.delete(tooltipId.current);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const closeAllTooltips = () => {
    tooltipCallbacks.forEach((callback, id) => {
      if (id !== tooltipId.current) {
        callback();
      }
    });
  };

  const openTooltip = () => {
    // Capturar las coordenadas del elemento trigger
    if (triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
    
    // Cerrar todos los otros tooltips
    closeAllTooltips();
    
    // Abrir este tooltip
    setIsVisible(true);
    activeTooltipId = tooltipId.current;
    
    // Auto-cerrar después de 4 segundos
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      activeTooltipId = null;
    }, 4000);
  };

  const closeTooltip = () => {
    setIsVisible(false);
    activeTooltipId = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'transform -translate-x-1/2 -translate-y-full';
      case 'bottom':
        return 'transform -translate-x-1/2';
      case 'left':
        return 'transform -translate-x-full -translate-y-1/2';
      case 'right':
        return 'transform -translate-y-1/2';
      default:
        return 'transform -translate-x-1/2 -translate-y-full';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white/80';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white/80';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white/80';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white/80';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white/80';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        className="p-2 -m-2 cursor-pointer" // Área de click expandida
        onClick={openTooltip}
      >
        {children}
      </div>
      
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed z-[999999] ${getPositionClasses()}`}
          style={{
            position: 'fixed',
            zIndex: 999999,
            left: rect ? (function() {
              const space = 8;
              switch (position) {
                case 'right':
                  return rect.right + space;
                case 'left':
                  return rect.left - space;
                case 'top':
                case 'bottom':
                default:
                  return rect.left + rect.width / 2;
              }
            })() : 0,
            top: rect ? (function() {
              const space = 8;
              switch (position) {
                case 'top':
                  return rect.top - space;
                case 'bottom':
                  return rect.bottom + space;
                case 'left':
                case 'right':
                default:
                  return rect.top + rect.height / 2;
              }
            })() : 0,
          }}
        >
          <div className="bg-white/80 backdrop-blur-md text-gray-800 text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal shadow-2xl border border-gray-300/40">
            <div className="flex items-start gap-2">
              <div className="flex-1 leading-relaxed">
                {content}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTooltip();
                }}
                className="flex-shrink-0 hover:bg-gray-200/50 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>
          {/* Arrow - positioned to point to the info icon */}
          <div className={`absolute w-0 h-0 border-[6px] ${getArrowClasses()}`}></div>
        </div>,
        document.body
      )}
    </div>
  );
}