// settings/page.tsx
"use client";
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  PaletteMode,
} from "@mui/material";
import { Palette } from "@/types/themeType";
import { usePaletteManagement } from "@/hook/usePaletteManagement";
import toast from "react-hot-toast";

export default function Settings() {
  const {
    currentPalette,
    customPalettes,
    isLoading,
    savePaletteToBackend,
    applyPalette,
    refreshPalettes,
  } = usePaletteManagement();

  // Custom Palette State
  const [custom, setCustom] = useState<
    Omit<Palette, "mode"> & { mode: string }
  >({
    mode: "light",
    customName: "",
    primary: currentPalette.primary,
    secondary: currentPalette.secondary,
    background: currentPalette.background,
    text: currentPalette.text,
    title: currentPalette.title,
  });

  // Palette Color Preview Component
  const PaletteCardPreview = ({
    mode,
    customName,
    primary,
    secondary,
    background,
    text,
    title,
    onClick,
  }: {
    mode: PaletteMode;
    customName: string;
    primary: string;
    secondary: string;
    background: string;
    text: string;
    title: string;
    onClick: () => void;
  }) => (
    <Box
      onClick={onClick}
      sx={{
        width: 120,
        height: 50,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: currentPalette.primary === primary ? 4 : 1,
        border:
          currentPalette.primary === primary
            ? "2px solid #000"
            : "1px solid #ccc",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <Box sx={{ display: "flex", height: "60%" }}>
        <Box sx={{ flex: 1, backgroundColor: primary }} />
        <Box sx={{ flex: 1, backgroundColor: secondary }} />
        <Box sx={{ flex: 1, backgroundColor: background }} />
        <Box sx={{ flex: 1, backgroundColor: text }} />
        <Box sx={{ flex: 1, backgroundColor: title }} />
      </Box>
      <Typography
        variant="caption"
        sx={{
          textAlign: "center",
          display: "block",
          color: text,
          backgroundColor: background,
        }}
      >
        {customName}
      </Typography>
    </Box>
  );

  const handleSaveCustom = async () => {
    if (!custom.customName.trim()) {
      return toast.error("Please enter a name for your palette! ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }

    if (!custom.mode || (custom.mode !== "light" && custom.mode !== "dark")) {
      return toast.error("Please select a valid mode (light or dark)! ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }

    const newPalette: Palette = {
      mode: custom.mode as PaletteMode,
      customName: custom.customName.trim(),
      primary: custom.primary,
      secondary: custom.secondary,
      background: custom.background,
      text: custom.text,
      title: custom.title,
    };

    const savedPalette = await savePaletteToBackend(newPalette);

    if (savedPalette) {
      // Reset form
      setCustom({
        mode: "light",
        customName: "",
        primary: currentPalette.primary,
        secondary: currentPalette.secondary,
        background: currentPalette.background,
        text: currentPalette.text,
        title: currentPalette.title,
      });

      toast.success("Custom palette saved successfully! 🎨");
    }
  };

  const handleApplyPalette = (palette: Palette) => {
    applyPalette(palette);
  };

  // Default palettes
  const defaultPalettes: Palette[] = [
    {
      mode: "light",
      customName: "Blue",
      primary: "#1E56A0",
      secondary: "#266DCB",
      background: "#FBFDFE",
      text: "#333333",
      title: "#1E56A0",
    },
    {
      mode: "light",
      customName: "Red",
      primary: "#B10C2E",
      secondary: "#6E0715",
      background: "#F6F6F6",
      text: "#2E2E2E",
      title: "#B10C2E",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">🎨 Select Palette</Typography>
        <Button
          variant="outlined"
          onClick={refreshPalettes}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* 🔹 Standard Palettes */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {/* Default Palettes */}
        {defaultPalettes.map((palette, index) => (
          <PaletteCardPreview
            key={`default-${index}`}
            mode={palette.mode}
            customName={palette.customName}
            primary={palette.primary}
            secondary={palette.secondary}
            background={palette.background}
            text={palette.text}
            title={palette.title}
            onClick={() => handleApplyPalette(palette)}
          />
        ))}

        {/* Custom Palettes from Backend */}
        {customPalettes.map((palette) => (
          <PaletteCardPreview
            key={palette._id || palette.customName}
            mode={palette.mode}
            customName={palette.customName}
            primary={palette.primary}
            secondary={palette.secondary}
            background={palette.background}
            text={palette.text}
            title={palette.title}
            onClick={() => handleApplyPalette(palette)}
          />
        ))}
      </Box>

      {/* 🔹 Create Custom Palette */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create Custom Palette
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField
          label="Custom Name"
          value={custom.customName}
          onChange={(e) => setCustom({ ...custom, customName: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Mode</InputLabel>
          <Select
            value={custom.mode}
            label="Mode"
            onChange={(e) => setCustom({ ...custom, mode: e.target.value })}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Primary"
          type="color"
          value={custom.primary}
          onChange={(e) => setCustom({ ...custom, primary: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: custom.primary,
                  borderRadius: 1,
                  mr: 1,
                  border: "1px solid #ccc",
                }}
              />
            ),
          }}
        />
        <TextField
          label="Secondary"
          type="color"
          value={custom.secondary}
          onChange={(e) => setCustom({ ...custom, secondary: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: custom.secondary,
                  borderRadius: 1,
                  mr: 1,
                  border: "1px solid #ccc",
                }}
              />
            ),
          }}
        />
        <TextField
          label="Background"
          type="color"
          value={custom.background}
          onChange={(e) => setCustom({ ...custom, background: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: custom.background,
                  borderRadius: 1,
                  mr: 1,
                  border: "1px solid #ccc",
                }}
              />
            ),
          }}
        />
        <TextField
          label="Text"
          type="color"
          value={custom.text}
          onChange={(e) => setCustom({ ...custom, text: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: custom.text,
                  borderRadius: 1,
                  mr: 1,
                  border: "1px solid #ccc",
                }}
              />
            ),
          }}
        />
        <TextField
          label="Title"
          type="color"
          value={custom.title}
          onChange={(e) => setCustom({ ...custom, title: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: custom.title,
                  borderRadius: 1,
                  mr: 1,
                  border: "1px solid #ccc",
                }}
              />
            ),
          }}
        />
      </Box>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSaveCustom}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={16} /> : null}
      >
        {isLoading ? "Saving..." : "Save Custom Palette"}
      </Button>
    </Box>
  );
}
