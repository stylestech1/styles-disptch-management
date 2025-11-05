"use client";
import { useDispatch, useSelector } from "react-redux";
import { switchPalette, setPalette, addCustomPalette } from "@/redux/slices/paletteSlice";
import { Box, Button, PaletteMode, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { RootState } from "@/redux/store";
import { Palette } from "@/types/themeType";
import toast from "react-hot-toast";

export default function Settings() {
  const dispatch = useDispatch();
  const { currentPalette, customPalettes } = useSelector((state: RootState) => state.palette);

  // Custom Palette State
  const [custom, setCustom] = useState<Omit<Palette, 'mode'> & { mode: string }>({
    mode: "light", // default value
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
        border: currentPalette.primary === primary ? "2px solid #000" : "1px solid #ccc",
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

  const handleSaveCustom = () => {
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

    // Save to custom palettes
    dispatch(addCustomPalette(newPalette));
    
    // Apply the new palette
    dispatch(setPalette(newPalette));

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
  };

  const handleApplyPalette = (palette: Palette) => {
    dispatch(setPalette(palette));
    toast.success(`Applied ${palette.customName} palette! 🎨`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        🎨 Select Palette
      </Typography>

      {/* 🔹 Standard Palettes */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <PaletteCardPreview
          mode="light"
          customName="Blue"
          primary="#1E56A0"
          secondary="#266DCB"
          background="#FBFDFE"
          text="#333"
          title="#1E56A0"
          onClick={() => dispatch(switchPalette("blue"))}
        />
        <PaletteCardPreview
          mode="light"
          customName="Red"
          primary="#B10C2E"
          secondary="#6E0715"
          background="#F6F6F6"
          text="#2E2E2E"
          title="#B10C2E"
          onClick={() => dispatch(switchPalette("red"))}
        />

        {/* Custom Palettes */}
        {customPalettes.map((palette, index) => (
          <PaletteCardPreview
            key={index}
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
          value={custom.primary}
          onChange={(e) => setCustom({ ...custom, primary: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          label="Secondary"
          value={custom.secondary}
          onChange={(e) => setCustom({ ...custom, secondary: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          label="Background"
          value={custom.background}
          onChange={(e) => setCustom({ ...custom, background: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          label="Text"
          value={custom.text}
          onChange={(e) => setCustom({ ...custom, text: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          label="Title"
          value={custom.title}
          onChange={(e) => setCustom({ ...custom, title: e.target.value })}
          size="small"
          sx={{ minWidth: 120 }}
        />
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveCustom}>
        Save Custom Palette
      </Button>

      {/* 🔹 Mode Switch */}
      {/* <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Theme Mode
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button 
            variant={currentPalette.mode === "light" ? "contained" : "outlined"}
            onClick={() => dispatch(setPalette({ ...currentPalette, mode: "light" }))}
          >
            Light Mode
          </Button>
          <Button 
            variant={currentPalette.mode === "dark" ? "contained" : "outlined"}
            onClick={() => dispatch(setPalette({ ...currentPalette, mode: "dark" }))}
          >
            Dark Mode
          </Button>
        </Box>
      </Box> */}
    </Box>
  );
}