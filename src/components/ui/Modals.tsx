"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { Box, Button, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const theme = useAppSelector((state: RootState) => state.palette)

  // closing popup
  useEffect(() => {
    const handleBodyScroll = (shouldPrevent: boolean) => {
      document.body.style.overflow = shouldPrevent ? "hidden" : "unset";
    };

    handleBodyScroll(isOpen);
    return () => handleBodyScroll(false);
  }, [isOpen]);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isSelectOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isSelectOpen]);
  useEffect(() => {
    const checkSelectState = () => {
      const selectMenus = document.querySelectorAll(
        ".MuiMenu-paper, .MuiPopover-root"
      );
      const isOpen = Array.from(selectMenus).some((menu) => {
        const style = window.getComputedStyle(menu);
        return style.display !== "none" && style.visibility !== "hidden";
      });
      setIsSelectOpen(isOpen);
    };

    const interval = setInterval(checkSelectState, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

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
          !modalRef.current.contains(e.target as Node) &&
          !isSelectOpen
        ) {
          onClose();
        }
      }}
    >
      <Box
      sx={{bgcolor: theme.currentPalette.background}}
        ref={modalRef}
        className={`relative rounded-2xl shadow-2xl border p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-in fade-in-90 zoom-in-90 duration-200`}
      >
        <div className="flex items-center justify-between mb-6 sticky top-0 pb-4 border-b">
          <Typography sx={{color: theme.currentPalette.primary, fontSize: '22px', fontWeight: 'bold'}}>{title}</Typography>
          {showCloseButton && (
            <Button
              onClick={onClose}
              className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </Button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </Box>
    </div>
  );
};

export default Modal;
