import Modal from "@/components/ui/Modals";
import { useGetLoadsQuery } from "@/redux/slices/apiSlice";
import { TLoads } from "@/types/globalTypes";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaFilePdf, FaFileUpload } from "react-icons/fa";
import { IoAdd, IoClose, IoDocument, IoDownload } from "react-icons/io5";
import { MdError, MdPictureAsPdf } from "react-icons/md";

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoad: TLoads | null;
  onAddDocument?: (loadId: string, files: File[]) => void;
}
interface Document {
  viewLink: string;
  downloadLink?: string;
  name?: string;
  type?: string;
  uploadedAt?: string;
  size?: string;
}

const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({
  isOpen,
  onClose,
  selectedLoad,
  onAddDocument,
}) => {
  const {
    data: loadsData,
    isLoading: documentLoading,
    refetch: refetchDocs,
  } = useGetLoadsQuery(
    { id: selectedLoad?.id },
    {
      skip: !selectedLoad?.id,
    }
  );

  // States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  // Extract Data
  const documents = selectedLoad?.documents || [];
  const loads = loadsData?.data || [];

  // handling unused refetch
  useEffect(() => {
    if (isOpen && selectedLoad) {
      refetchDocs();
      setSelectedFiles([]);
      setUploadError("");
    }
  }, [isOpen, selectedLoad, refetchDocs]);

  // Close Popup
  const handleClose = () => {
    setSelectedFiles([]);
    setUploadError("");
    onClose();
  };

  // Selecting Files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadError("");

    // Checking of documents number
    const totalFiles = selectedFiles.length + newFiles.length;
    if (totalFiles > 2) {
      setUploadError("You can only upload maximun 2 files 😢");
      return;
    }

    // Checking of documents type
    const invalidFiles = newFiles.filter((file) => {
      const fileExtension = file.name.toLowerCase().split(".").pop();
      return fileExtension !== "pdf" && file.type !== "application/pdf";
    });
    if (invalidFiles.length > 0) {
      setUploadError("Only PDF files are allowed 😒");
      return;
    }

    // reset
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  // Add New Document
  const handleAddDocClick = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Please select at least one PDF file 😉");
      return;
    }

    if (selectedLoad?.id) {
      await onAddDocument?.(selectedLoad.id, selectedFiles);
      setSelectedFiles([]);
      setUploadError("");
    }
  };

  // Extract Name from link
  const getFileNameFromLink = (link: string): string => {
    try {
      const url = new URL(link);
      const pathname = url.pathname;
      const filename = pathname.split("/").pop() || "Document";
      return decodeURIComponent(filename);
    } catch {
      return "Document";
    }
  };

  // Remove Document
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadError("");
  };

  // Extract Icon from link
  const getFileIcon = (link: string, type?: string) => {
    const fileName = getFileNameFromLink(link);

    if (
      fileName.toLowerCase().includes(".pdf") ||
      type === "pdf" ||
      link.toLowerCase().includes(".pdf") ||
      link.toLowerCase().includes("pdf")
    ) {
      return <MdPictureAsPdf className="text-red-500" size={20} />;
    }
    return <IoDocument className="text-blue-500" size={20} />;
  };

  // Extract Type from link
  const getFileType = (link: string, type?: string) => {
    const fileName = getFileNameFromLink(link);

    if (
      fileName.toLowerCase().includes(".pdf") ||
      type === "pdf" ||
      link.toLowerCase().includes(".pdf") ||
      link.toLowerCase().includes("pdf")
    ) {
      return "PDF Document";
    }

    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      jpg: "JPEG Image",
      jpeg: "JPEG Image",
      png: "PNG Image",
      gif: "GIF Image",
      doc: "Word Document",
      docx: "Word Document",
      xls: "Excel Spreadsheet",
      xlsx: "Excel Spreadsheet",
      txt: "Text File",
    };

    return typeMap[fileExtension || ""] || "Document";
  };

  // Checking from is it PDF or not
  const isPDFDocument = (document: Document): boolean => {
    if (!document.viewLink) return false;

    const fileName = getFileNameFromLink(document.viewLink);
    const link = document.viewLink.toLowerCase();

    return Boolean(
      fileName.toLowerCase().includes(".pdf") ||
        document.type === "pdf" ||
        link.includes(".pdf") ||
        link.includes("/pdf") ||
        link.includes("application/pdf") ||
        (document.downloadLink &&
          document.downloadLink.toLowerCase().includes(".pdf"))
    );
  };

  const handleViewDocument = (document: Document) => {
    if (document.viewLink) {
      if (document.viewLink.includes("drive.google.com")) {
        const fileId = extractGoogleDriveFileId(document.viewLink);
        if (fileId) {
          const directPdfLink = `https://drive.google.com/file/d/${fileId}/preview`;
          window.open(directPdfLink, "_blank");
        } else {
          window.open(document.viewLink, "_blank");
        }
      } else {
        window.open(document.viewLink, "_blank");
      }
    }
  };

  // Handling GoogleDrive link
  const extractGoogleDriveFileId = (url: string): string | null => {
    try {
      const patterns = [/\/file\/d\/([^\/]+)/, /id=([^&]+)/, /\/d\/([^\/]+)/];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Download PDF
  const handleDownload = (document: Document) => {
    if (document.downloadLink) {
      window.open(document.downloadLink, "_blank");
    } else if (document.viewLink) {
      const link = document.viewLink;
      const fileName = getFileNameFromLink(link);
      const anchor = window.document.createElement("a");
      anchor.href = link;
      anchor.download = fileName;
      anchor.target = "_blank";
      window.document.body.appendChild(anchor);
      anchor.click();
      window.document.body.removeChild(anchor);
    }
  };

  // Estimate File Size
  const estimateFileSize = (link: string): string => {
    const sizes = ["0.5 MB", "1.2 MB", "2.1 MB", "3.5 MB", "4.8 MB"];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const canAddMoreFiles = documents.length + selectedFiles.length < 2;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`View Documents - (${selectedLoad?.loadId || "N/A"})`}
      size="md"
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {documentLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document: Document, index: number) => {
              const fileName = getFileNameFromLink(document.viewLink);
              const isPDF = isPDFDocument(document);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.viewLink, document.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p
                          className="text-sm font-medium text-slate-800 truncate"
                          title={fileName}
                        >
                          {fileName}
                        </p>
                        {isPDF && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            PDF
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                        <span>
                          {getFileType(document.viewLink, document.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleViewDocument(document)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isPDF
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      title={isPDF ? "View PDF" : "View Document"}
                    >
                      {isPDF ? (
                        <FaFilePdf size={14} />
                      ) : (
                        <FaExternalLinkAlt size={14} />
                      )}
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleDownload(document)}
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors duration-200"
                      title="Download Document"
                    >
                      <IoDownload size={14} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 border border-slate-300">
              <FaFileUpload size={24} className="text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              No Documents Found
            </h4>
            <p className="text-slate-500 text-sm max-w-xs">
              There are no documents for this load yet. Add PDF documents to
              track important information.
            </p>
          </div>
        )}

        {/* File Upload Section */}
        {documents.length !== 2 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <MdPictureAsPdf className="text-red-500" size={32} />
              </div>
              <h5 className="text-sm font-semibold text-slate-700 mb-1">
                Add PDF Documents
              </h5>
              <p className="text-xs text-slate-500 mb-4">
                Maximum 2 PDF files allowed
              </p>

              <input
                type="file"
                id="pdf-upload"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileSelect}
                disabled={!canAddMoreFiles}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  canAddMoreFiles
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <IoAdd size={16} />
                Select PDF Files
              </label>

              {uploadError && (
                <div className="mt-3 flex items-center justify-center gap-2 text-red-600 text-sm">
                  <MdError size={16} />
                  {uploadError}
                </div>
              )}

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Selected Files ({selectedFiles.length}/2):
                  </p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <MdPictureAsPdf className="text-red-500" size={18} />
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {file.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <IoClose size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {documents.length} of 2 document{documents.length !== 1 ? "s" : ""}{" "}
            uploaded
            {loads?.createdBy && (
              <span className="ml-2 text-slate-500">
                • Added by: {loads.createdBy}
              </span>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <button
              onClick={handleAddDocClick}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              <IoAdd size={18} />
              Upload {selectedFiles.length} File
              {selectedFiles.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewDocumentModal;
