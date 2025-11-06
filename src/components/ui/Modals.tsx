"use client";

import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOutsideClick = true,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBodyScroll = (shouldPrevent: boolean) => {
      document.body.style.overflow = shouldPrevent ? "hidden" : "unset";
    };

    handleBodyScroll(isOpen);
    return () => handleBodyScroll(false);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (
          closeOnOutsideClick &&
          modalRef.current &&
          !modalRef.current.contains(e.target as Node)
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-90 duration-200`}
      >
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
