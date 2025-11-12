"use client";
import { useState, useEffect } from "react";
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

  const [custom, setCustom] = useState<
    Omit<Palette, "mode" | "_id"> & { mode: string }
  >({
    mode: "light",
    customName: "",
    primary: "#1E56A0",
    secondary: "#266DCB",
    background: "#FBFDFE",
    text: "#333333",
    title: "#1E56A0",
  });

  useEffect(() => {
    setCustom((prev) => ({
      ...prev,
      primary: currentPalette.primary,
      secondary: currentPalette.secondary,
      background: currentPalette.background,
      text: currentPalette.text,
      title: currentPalette.title,
    }));
  }, [currentPalette]);

  const PaletteCardPreview = ({
    palette,
    onClick,
  }: {
    palette: Palette;
    onClick: () => void;
  }) => (
    <Box
      onClick={onClick}
      sx={{
        width: 120,
        height: 60,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: currentPalette.customName === palette.customName ? 4 : 1,
        border:
          currentPalette.customName === palette.customName
            ? `2px solid ${palette.primary}`
            : "1px solid #ccc",
        "&:hover": {
          boxShadow: 4,
          transform: "scale(1.05)",
          transition: "all 0.2s ease-in-out",
        },
      }}
    >
      <Box sx={{ display: "flex", height: "70%" }}>
        <Box sx={{ flex: 1, backgroundColor: palette.primary }} />
        <Box sx={{ flex: 1, backgroundColor: palette.secondary }} />
        <Box sx={{ flex: 1, backgroundColor: palette.background }} />
        <Box sx={{ flex: 1, backgroundColor: palette.text }} />
        <Box sx={{ flex: 1, backgroundColor: palette.title }} />
      </Box>
      <Box
        sx={{
          height: "30%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.background,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            color: palette.text,
            fontWeight:
              currentPalette.customName === palette.customName
                ? "bold"
                : "normal",
          }}
        >
          {palette.customName}
        </Typography>
      </Box>
    </Box>
  );

  const handleSaveCustom = async () => {
    if (!custom.customName.trim()) {
      toast.error("Please enter a name for your palette! ❌");
      return;
    }

    if (!custom.mode || (custom.mode !== "light" && custom.mode !== "dark")) {
      toast.error("Please select a valid mode (light or dark)! ❌");
      return;
    }

    const colorFields = ["primary", "secondary", "background", "text", "title"];
    for (const field of colorFields) {
      if (
        !custom[field as keyof typeof custom] ||
        !/^#[0-9A-F]{6}$/i.test(custom[field as keyof typeof custom])
      ) {
        toast.error(`Please enter a valid color for ${field}! ❌`);
        return;
      }
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
      setCustom({
        mode: "light",
        customName: "",
        primary: "#1E56A0",
        secondary: "#266DCB",
        background: "#FBFDFE",
        text: "#333333",
        title: "#1E56A0",
      });
    }
  };

  const handleApplyPalette = (palette: Palette) => {
    applyPalette(palette);
  };

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
    {
      mode: "light",
      customName: "Sunset",
      primary: "#FF6B6B",
      secondary: "#FFB86B",
      background: "#FFF7F3",
      text: "#2B2B2B",
      title: "#D9534F",
    },
    {
      mode: "light",
      customName: "Teal Mint",
      primary: "#0FB39E",
      secondary: "#2DD4BF",
      background: "#F5FFFD",
      text: "#05292E",
      title: "#0A7C78",
    },
    // {
    //   mode: "dark",
    //   customName: "Midnight",
    //   primary: "#3B82F6",
    //   secondary: "#1E40AF",
    //   background: "#0F1724",
    //   text: "#E6EEF8",
    //   title: "#60A5FA",
    // },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "center", sm: "space-between" },
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          🎨 Palette Settings
        </Typography>
        <Button
          variant="outlined"
          onClick={refreshPalettes}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          Refresh Palettes
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Available Palettes
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Default Palettes
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2, md: 3 },
            justifyContent: { xs: "center", sm: "flex-start" },
            mb: { xs: 2, sm: 3, md: 4 },
            flexWrap: "wrap",
          }}
        >
          {defaultPalettes.map((palette, index) => (
            <PaletteCardPreview
              key={`default-${index}`}
              palette={palette}
              onClick={() => handleApplyPalette(palette)}
            />
          ))}
        </Box>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Custom Palettes
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2, md: 3 },
            justifyContent: { xs: "center", sm: "flex-start" },
            mb: { xs: 2, sm: 3, md: 4 },
            flexWrap: "wrap",
          }}
        >
          {customPalettes.length > 0 ? (
            customPalettes.map((palette) => (
              <PaletteCardPreview
                key={palette._id || palette.customName}
                palette={palette}
                onClick={() => handleApplyPalette(palette)}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No custom palettes yet. Create one below!
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Create Custom Palette
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 1.5, sm: 2, md: 3 },
            justifyContent: "flex-start",
            mb: { xs: 2, sm: 3, md: 4 },
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Palette Name"
            value={custom.customName}
            onChange={(e) =>
              setCustom({ ...custom, customName: e.target.value })
            }
            size="small"
            sx={{ minWidth: { xs: "100%", md: 200 } }}
            placeholder="Enter palette name"
          />

          <FormControl size="small" sx={{ minWidth: { sx: "100%", md: 120 } }}>
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
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
          {[
            { label: "Primary", value: custom.primary, key: "primary" },
            { label: "Secondary", value: custom.secondary, key: "secondary" },
            {
              label: "Background",
              value: custom.background,
              key: "background",
            },
            { label: "Text", value: custom.text, key: "text" },
            { label: "Title", value: custom.title, key: "title" },
          ].map((color) => (
            <TextField
              key={color.key}
              label={color.label}
              type="color"
              value={color.value}
              onChange={(e) =>
                setCustom({ ...custom, [color.key]: e.target.value })
              }
              size="small"
              sx={{ minWidth: { xs: "100%", md: 150 } }}
              InputProps={{
                startAdornment: (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      backgroundColor: color.value,
                      borderRadius: 1,
                      mr: 1,
                      border: "1px solid #ccc",
                    }}
                  />
                ),
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={handleSaveCustom}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
            size="large"
          >
            {isLoading ? "Saving..." : "Save Custom Palette"}
          </Button>

          <Button
            variant="outlined"
            onClick={() =>
              setCustom({
                mode: "light",
                customName: "",
                primary: "#1E56A0",
                secondary: "#266DCB",
                background: "#FBFDFE",
                text: "#333333",
                title: "#1E56A0",
              })
            }
            disabled={isLoading}
          >
            Reset Form
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
