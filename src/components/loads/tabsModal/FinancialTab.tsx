"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { FinancialTabProps } from "@/types/globalTypes";
import {
  alpha,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CircleDollarSign,
  Coins,
  DollarSign,
  KeyRound,
  Plus,
  Trash2,
} from "lucide-react";
import { IoAdd, IoCash, IoCheckmark, IoClose, IoKey } from "react-icons/io5";
import { MdError, MdPictureAsPdf } from "react-icons/md";
import { useState } from "react";
type Adjustment = {
  id: number; // unique ID
  type: "Bonus" | "Detention" | "Deduction";
  amount: number;
};

// Load Details Tab Component
const FinancialTab: React.FC<FinancialTabProps> = ({
  allDistance,
  price,
  fees,
  loadIDInp,
  pricePerMile,
  destinations,
  isEditing,
  selectedDocuments,
  uploadError,
  isDragging,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onRemoveFile,
  onPriceChange,
  onFeesChange,
  onLoadIDChange,
  isTabValid,
  onPrevTab,
  onNextTab,
}) => {
  const canAddMoreFiles = selectedDocuments.length < 2;
  const theme = useAppSelector((state: RootState) => state.palette);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const handleAddAdjustment = () => {
    setAdjustments((prev) => [
      ...prev,
      { id: Date.now(), type: "Bonus", amount: 0 },
    ]);
  };

  const handleRemoveAdjustment = (id: number) => {
    setAdjustments((prev) => prev.filter((adj) => adj.id !== id));
  };

  const handleTypeChange = (
    id: number,
    type: "Bonus" | "Detention" | "Deduction",
  ) => {
    setAdjustments((prev) =>
      prev.map((adj) => (adj.id === id ? { ...adj, type } : adj)),
    );
  };

  const handleAmountChange = (id: number, amount: number) => {
    setAdjustments((prev) =>
      prev.map((adj) => (adj.id === id ? { ...adj, amount } : adj)),
    );
  };

  return (
    <div className="space-y-6 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5">
        <Box className="flex justify-start">
          <Typography>Load Identity & Pricing</Typography>
        </Box>

        <Box
          sx={{
            border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
            borderRadius: 2,
          }}
          className="grid grid-cols-1 md:grid-cols-3"
        >
          <Stack
            direction="column"
            alignItems="center"
            spacing={0.5}
            sx={{
              borderRight: `1px solid ${alpha(
                theme.currentPalette.primary,
                0.3,
              )}`,
            }}
          >
            <Typography
              sx={{
                bgcolor: alpha(theme.currentPalette.text, 0.05),
                padding: 2,
                width: "100%",
                textAlign: "center",
              }}
            >
              Load ID <span className="text-red-600">*</span>
            </Typography>

            <div className="relative w-full">
              <TextField
                type="text"
                value={loadIDInp}
                onChange={(e) => onLoadIDChange(e.target.value)}
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                }}
                placeholder="0.00"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyRound
                          className="h-5 w-5"
                          color={theme.currentPalette.secondary}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </Stack>

          <Stack
            direction="column"
            alignItems="center"
            spacing={0.5}
            sx={{
              borderRight: `1px solid ${alpha(
                theme.currentPalette.primary,
                0.3,
              )}`,
            }}
          >
            <Typography
              sx={{
                bgcolor: alpha(theme.currentPalette.text, 0.05),
                padding: 2,
                width: "100%",
                textAlign: "center",
              }}
            >
              Total Price <span className="text-red-600">*</span>
            </Typography>

            <div className="relative w-full">
              <TextField
                type="text"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                }}
                placeholder="0.00"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <DollarSign className="h-5 w-5" color={"#317435"} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </Stack>

          <Stack direction="column" alignItems="center" spacing={0.5}>
            <Typography
              sx={{
                bgcolor: alpha(theme.currentPalette.text, 0.05),
                padding: 2,
                width: "100%",
                textAlign: "center",
              }}
            >
              Fees Number
            </Typography>

            <div className="relative w-full">
              <TextField
                type="text"
                value={fees}
                onChange={(e) => onFeesChange(e.target.value)}
                sx={{
                  bgcolor: theme.currentPalette.background,
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                }}
                placeholder="0.00"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Coins className="h-5 w-5" color={"#317435"} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </Stack>
        </Box>

        <Box
          sx={{
            border: `1px solid ${alpha(theme.currentPalette.primary, 0.3)}`,
            borderRadius: 2,
            padding: 2,
            bgcolor: alpha(theme.currentPalette.text, 0.05),
          }}
          className="flex flex-col md:flex-row items-end justify-between"
        >
          <Stack>
            <Typography
              sx={{
                color: alpha(theme.currentPalette.text, 0.7),
                fontWeight: "bold",
              }}
            >
              Financial Summary
            </Typography>

            <div className="my-3">
              <Typography
                sx={{
                  color: alpha(theme.currentPalette.text, 0.7),
                  fontWeight: "normal",
                }}
              >
                Calculated Distance
              </Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                {allDistance ? `${allDistance} miles` : "Calculating..."}
              </Typography>
            </div>

            <div>
              <Typography
                sx={{
                  color: alpha(theme.currentPalette.text, 0.7),
                  fontWeight: "normal",
                }}
              >
                Total Price
              </Typography>
              <Typography sx={{ fontWeight: "bold", color: "#317435" }}>
                {price ? `$${price}` : "0.00"}
              </Typography>
            </div>
          </Stack>

          <Stack direction="column" alignItems={"start"} spacing={0.5}>
            -
            <Typography
              sx={{
                padding: 2,
                width: "100%",
                textAlign: "start",
              }}
            >
              Price Per Mile <span className="text-red-600">*</span>
            </Typography>
            <div className="relative">
              <TextField
                aria-readonly
                type="text"
                disabled
                value={
                  pricePerMile !== null &&
                  !isNaN(pricePerMile) &&
                  isFinite(pricePerMile)
                    ? `$${pricePerMile.toFixed(3)}`
                    : "$0.000"
                }
                sx={{
                  bgcolor: theme.currentPalette.background,
                  border: `2px solid ${alpha(
                    theme.currentPalette.primary,
                    0.3,
                  )}`,
                  width: "100%",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderRadius: 2,
                    },
                  },
                }}
                placeholder="Auto-calculating total distance..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CircleDollarSign className="h-5 w-5 text-[#317435]" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          </Stack>
        </Box>

        {/* Financial Adjustments*/}
        <div className="flex justify-between items-center mb-2">
          <Typography sx={{ color: theme.currentPalette.text }}>
            Financial Adjustments
          </Typography>

          <Button
            type="button"
            onClick={handleAddAdjustment}
            startIcon={<Plus size={14} />}
            sx={{
              color: theme.currentPalette.primary,
              border: `1px solid ${alpha(theme.currentPalette.primary, 0.4)}`,
              borderRadius: "6px",
              textTransform: "none",
              padding: "4px 12px",
              fontSize: "13px",
            }}
          >
            Add Adjustment
          </Button>
        </div>
        {adjustments.map((adj) => (
          <Box
            key={adj.id}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            {/* Type */}
            <TextField
              select
              value={adj.type}
              onChange={(e) =>
                handleTypeChange(
                  adj.id,
                  e.target.value as "Bonus" | "Detention" | "Deduction",
                )
              }
              SelectProps={{ native: true }}
              sx={{
                minWidth: 120,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  height: 40,
                  border: "1px solid #E5E7EB",
                },
              }}
            >
              <option value="Bonus">Bonus</option>
              <option value="Detention">Detention</option>
              <option value="Deduction">Deduction</option>
            </TextField>

            {/* Amount */}
            <TextField
              fullWidth
              value={adj.amount}
              placeholder="0"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  height: 40,
                  border: "1px solid #E5E7EB",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DollarSign size={16} color="#317435" />
                  </InputAdornment>
                ),
              }}
            />
            {/* Delete */}
            <IconButton
              sx={{
                color: "#A3231B",
              }}
              onClick={() => handleRemoveAdjustment(adj.id)}
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>
        ))}

        {/* Documents - Drag & Drop Area */}
        <div className="md:col-span-2">
          <Typography sx={{ color: theme.currentPalette.text, mb: 1 }}>
            Upload Documents
          </Typography>

          <div
            className={`
              border-2 rounded-lg p-6 transition-all duration-200
              ${isDragging ? "ring-2 ring-offset-1" : ""}
            `}
            style={{
              borderColor: isDragging
                ? theme.currentPalette.primary
                : alpha(theme.currentPalette.primary, 0.3),
              backgroundColor: isDragging
                ? `${theme.currentPalette.primary}20`
                : theme.currentPalette.background,
            }}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <MdPictureAsPdf
                  color={alpha(theme.currentPalette.secondary, 0.7)}
                  size={50}
                />
              </div>

              <input
                type="file"
                id="pdf-upload-create"
                accept=".pdf,application/pdf"
                multiple
                onChange={onFileSelect}
                disabled={!canAddMoreFiles}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload-create"
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
                  transition-all duration-200 cursor-pointer
                  ${canAddMoreFiles ? "" : "cursor-not-allowed opacity-60"}
                `}
                style={{
                  backgroundColor: canAddMoreFiles
                    ? theme.currentPalette.primary
                    : theme.currentPalette.background,
                  color: canAddMoreFiles
                    ? theme.currentPalette.background
                    : theme.currentPalette.text,
                  border: `1px solid ${
                    canAddMoreFiles
                      ? theme.currentPalette.primary
                      : theme.currentPalette.text
                  }`,
                }}
              >
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
                  {selectedDocuments.map((file, index) => (
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
                      <Button
                        variant="contained"
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <IoClose size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
            type="button"
            onClick={onPrevTab}
          >
            Back
          </Button>
          <Button
            sx={{
              bgcolor: theme.currentPalette.primary,
              color: theme.currentPalette.background,
            }}
            type="button"
            onClick={onNextTab}
            disabled={!isTabValid}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;
