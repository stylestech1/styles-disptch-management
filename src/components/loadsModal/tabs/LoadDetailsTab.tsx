import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField, InputAdornment } from "@mui/material";
import {
  IoArrowBack,
  IoArrowForward,
  IoClose,
  IoAdd,
  IoCash,
  IoKey,
  IoCheckmark,
} from "react-icons/io5";
import { MdError, MdPictureAsPdf } from "react-icons/md";
import dayjs from "dayjs";
import { TPlace } from "@/components/sections/LocationAutocomplete";
import { FileHandlers } from "@/types/loadsTyles"

interface LoadDetailsTabProps {
  price: string;
  fees: string;
  loadIDInp: string;
  pickupAt: string | null;
  completedAt: string | null;
  arrivalAtShipper: string | null;
  arrivalAtReceiver: string | null;
  leftShipper: string | null;
  leftReceiver: string | null;
  destinations: (TPlace | null)[];
  isEditing: boolean;
  pricePerMile: number | null;
  allDistance: string;
  fileHandlers: FileHandlers;
  dispatchFunctions: {
    setPrice: (value: string) => void;
    setFees: (value: string) => void;
    setLoadIDInp: (value: string) => void;
    setPickupAt: (value: string | null) => void;
    setCompletedAt: (value: string | null) => void;
    setArrivalAtShipper: (value: string | null) => void;
    setArrivalAtReceiver: (value: string | null) => void;
    setLeftShipper: (value: string | null) => void;
    setLeftReceiver: (value: string | null) => void;
  };
  onPrevTab: () => void;
  onNextTab: () => void;
  isTabValid: boolean;
}

const LoadDetailsTab: React.FC<LoadDetailsTabProps> = ({
  price,
  fees,
  loadIDInp,
  pickupAt,
  completedAt,
  arrivalAtShipper,
  arrivalAtReceiver,
  leftShipper,
  leftReceiver,
  destinations,
  isEditing,
  pricePerMile,
  allDistance,
  fileHandlers,
  dispatchFunctions,
  onPrevTab,
  onNextTab,
  isTabValid,
}) => {
  const {
    selectedDocuments,
    uploadError,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
  } = fileHandlers;

  // Convert to Dayjs
  const pickupAtDayjs = pickupAt ? dayjs(pickupAt) : null;
  const completedAtDayjs = completedAt ? dayjs(completedAt) : null;
  const arrivalAtShipperDayjs = arrivalAtShipper ? dayjs(arrivalAtShipper) : null;
  const arrivalAtReceiverDayjs = arrivalAtReceiver ? dayjs(arrivalAtReceiver) : null;
  const leftShipperDayjs = leftShipper ? dayjs(leftShipper) : null;
  const leftReceiverDayjs = leftReceiver ? dayjs(leftReceiver) : null;

  const canAddMoreFiles = selectedDocuments.length < 2;

  // Handlers for form fields
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchFunctions.setPrice(e.target.value);
  };

  const handleFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchFunctions.setFees(e.target.value);
  };

  const handleLoadIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchFunctions.setLoadIDInp(e.target.value);
  };

  const handlePickupAtChange = (value: dayjs.Dayjs | null) => {
    dispatchFunctions.setPickupAt(value ? value.toISOString() : null);
  };

  const handleCompletedAtChange = (value: dayjs.Dayjs | null) => {
    dispatchFunctions.setCompletedAt(value ? value.toISOString() : null);
  };

  const handleArrivalAtShipperChange = (value: dayjs.Dayjs | null) => {
    dispatchFunctions.setArrivalAtShipper(value ? value.toISOString() : null);
  };

  const handleArrivalAtReceiverChange = (value: dayjs.Dayjs | null) => {
    dispatchFunctions.setArrivalAtReceiver(value ? value.toISOString() : null);
  };

  const handleLeftShipperChange = (value: dayjs.Dayjs | null) => {
    dispatchFunctions.setLeftShipper(value ? value.toISOString() : null);
  };

  const handleLeftReceiverChange = (value: dayjs.Dayjs | null) => {
    dispatchFunctions.setLeftReceiver(value ? value.toISOString() : null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculated All Distance - Read Only */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Calculated All Distance
          </label>
          <TextField
            fullWidth
            type="text"
            value={allDistance ? `${allDistance} miles` : "Calculating..."}
            className="bg-slate-50"
            placeholder="Auto-calculating total distance..."
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IoCheckmark className="h-5 w-5 text-green-600" />
                </InputAdornment>
              ),
            }}
          />
          {allDistance && (
            <p className="text-xs text-slate-500 mt-1">
              Total route: → {destinations.filter((d) => d !== null).length} destination(s)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Total Price <span className="text-red-500">*</span>
          </label>
          <TextField
            fullWidth
            type="text"
            value={price}
            onChange={handlePriceChange}
            placeholder="0.00"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoCash className="h-5 w-5 text-slate-400" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Price Per Mile
          </label>
          <TextField
            fullWidth
            type="text"
            value={
              pricePerMile !== null && !isNaN(pricePerMile) && isFinite(pricePerMile)
                ? `$${pricePerMile.toFixed(3)}`
                : "$0.000"
            }
            className="bg-slate-50"
            placeholder="Auto-calculating..."
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IoCash className="h-5 w-5 text-slate-400" />
                </InputAdornment>
              ),
            }}
          />
          {pricePerMile !== null && !isNaN(pricePerMile) && isFinite(pricePerMile) && (
            <p className="text-xs text-slate-500 mt-1">
              Calculated automatically: ${price} ÷ {allDistance} miles
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fees Number
          </label>
          <TextField
            fullWidth
            type="text"
            value={fees}
            onChange={handleFeesChange}
            placeholder="0.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoCash className="h-5 w-5 text-slate-400" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Load Id <span className="text-red-500">*</span>
          </label>
          <TextField
            fullWidth
            type="text"
            value={loadIDInp}
            onChange={handleLoadIDChange}
            placeholder="Enter load ID"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoKey className="h-5 w-5 text-slate-400" />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="md:col-span-2">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup DateTime */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pickup <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
                  value={pickupAtDayjs}
                  onChange={handlePickupAtChange}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      className: "bg-white",
                    },
                  }}
                />
              </div>

              {/* Completed DateTime */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Delivery <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
                  value={completedAtDayjs}
                  onChange={handleCompletedAtChange}
                  views={["year", "month", "day", "hours", "minutes"]}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      className: "bg-white",
                    },
                  }}
                />
              </div>

              {isEditing && (
                <>
                  {/* ArrivalAtShipper */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Arrival At Shipper
                    </label>
                    <DateTimePicker
                      value={arrivalAtShipperDayjs}
                      onChange={handleArrivalAtShipperChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          className: "bg-white",
                        },
                      }}
                    />
                  </div>

                  {/* Arrival At Receiver */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Arrival At Receiver
                    </label>
                    <DateTimePicker
                      value={arrivalAtReceiverDayjs}
                      onChange={handleArrivalAtReceiverChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          className: "bg-white",
                        },
                      }}
                    />
                  </div>

                  {/* Left Shipper */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Left Shipper
                    </label>
                    <DateTimePicker
                      value={leftShipperDayjs}
                      onChange={handleLeftShipperChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          className: "bg-white",
                        },
                      }}
                    />
                  </div>

                  {/* Left Receiver */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Left Receiver
                    </label>
                    <DateTimePicker
                      value={leftReceiverDayjs}
                      onChange={handleLeftReceiverChange}
                      views={["year", "month", "day", "hours", "minutes"]}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          className: "bg-white",
                        },
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </LocalizationProvider>
        </div>

        {/* Documents - Drag & Drop Area */}
        <div className="md:col-span-2">
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <MdPictureAsPdf
                  className={isDragging ? "text-blue-500" : "text-red-500"}
                  size={32}
                />
              </div>
              <h5 className="text-sm font-semibold text-slate-700 mb-1">
                Add PDF Documents (Optional)
              </h5>
              <p className="text-xs text-slate-500 mb-4">
                Maximum 2 PDF files allowed - You can add documents later
              </p>

              <input
                type="file"
                id="pdf-upload-create"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileSelect}
                disabled={!canAddMoreFiles}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload-create"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  canAddMoreFiles
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <IoAdd size={16} />
                Select PDF Files
              </label>

              <p className="text-xs text-slate-500 mt-3">
                or <strong>drag and drop</strong> PDF files here
              </p>

              {uploadError && (
                <div className="mt-3 flex items-center justify-center gap-2 text-red-600 text-sm">
                  <MdError size={16} />
                  {uploadError}
                </div>
              )}

              {/* Selected Files Preview */}
              {selectedDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Selected Files ({selectedDocuments.length}/2):
                  </p>
                  {selectedDocuments.map((file: File, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <MdPictureAsPdf className="text-red-500" size={18} />
                        <div className="text-left">
                          <p className="text-sm font-medium text-slate-800">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrevTab}
          className="uppercase cursor-pointer flex items-center gap-2 py-2 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
        >
          <IoArrowBack size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onNextTab}
          disabled={!isTabValid}
          className={`uppercase flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-colors ${
            isTabValid
              ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          Next
          <IoArrowForward size={16} />
        </button>
      </div>
    </div>
  );
};

export default LoadDetailsTab;