import Modal from "@/components/ui/Modals";
import { useGetLoadsQuery } from "@/redux/slices/apiSlice";
import { TLoads } from "@/types/globalTypes";
import { useEffect, useState } from "react";
import { FaExternalLinkAlt, FaFilePdf, FaFileUpload } from "react-icons/fa";
import { IoDocument, IoDownload } from "react-icons/io5";
import { MdPictureAsPdf } from "react-icons/md";

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

  // Extract Name from link
const getFileNameFromLink = (link: string): string => {
  try {
    const matches = link.match(/\/([^\/?]+)(?=\?|$)/);
    if (matches && matches[1]) {
      let filename = matches[1];
      filename = decodeURIComponent(filename);
      const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
      return nameWithoutExt || "Document";
    }
    const queryMatch = link.match(/[?&]name=([^&]+)/);
    if (queryMatch && queryMatch[1]) {
      let filename = queryMatch[1];
      filename = decodeURIComponent(filename);
      const nameWithoutExt = filename.split('.').slice(0, -1).join('.') || filename;
      return nameWithoutExt || "Document";
    }
    return "Document";
  } catch {
    return "Document";
  }
};

  // Extract Icon from link
  const getFileIcon = (link: string, type?: string) => {
    if (!link || typeof link !== "string") {
      return <IoDocument className="text-gray-500" size={20} />;
    }

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
    if (!link || typeof link !== "string") {
      return <IoDocument className="text-gray-500" size={20} />;
    }

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
        </div>
      </div>
    </Modal>
  );
};

export default ViewDocumentModal;
