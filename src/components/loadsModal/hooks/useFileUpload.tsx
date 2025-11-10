import { useState, useCallback } from "react";
import { validateFiles } from "../utils/validation";

export const useFileUpload = () => {
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
  }, []);

  const processFiles = (files: File[]) => {
    setUploadError("");

    const error = validateFiles([...selectedDocuments, ...files]);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedDocuments((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    processFiles(Array.from(files));
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    selectedDocuments,
    uploadError,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
    setSelectedDocuments
  };
};