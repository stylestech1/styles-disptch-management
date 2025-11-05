"use client";
import { useDispatch, useSelector } from "react-redux";
import { switchPalette, setPalette } from "@/redux/slices/paletteSlice";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { RootState } from "@/redux/store";
import { Palette } from "@/types/themeType";
import toast from "react-hot-toast";

export default function Settings() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.palette);

  // Custom Palette
  const [customPalette, setCustomPalette] = useState<Palette[]>([]);
  const [custom, setCustom] = useState<Palette>({
    mode: "",
    primary: theme.primary,
    secondary: theme.secondary,
    background: theme.background,
    text: theme.text,
    title: theme.title,
  });

  // Palette Color Preview
  const PaletteCardPreview = ({
    mode,
    primary,
    secondary,
    background,
    text,
    title,
    onClick,
  }: {
    mode: string;
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
        boxShadow: theme.primary === primary ? 4 : 1,
        border: theme.primary === primary ? "2px solid #000" : "1px solid #ccc",
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
        {mode}
      </Typography>
    </Box>
  );

  const handleSaveCustom = () => {
    if (!custom.mode.trim())
      return toast.error("Please enter a name for your palette! ❌", {
        style: { background: "#dc2626", color: "#fff" },
      });

    const newPalette = {
      ...custom,
      mode: custom.mode.trim(),
    };

    setCustomPalette([...customPalette, newPalette]);

    dispatch(
      setPalette({
        mode: "custom",
        primary: custom.primary,
        secondary: custom.secondary,
        background: custom.background,
        text: custom.text,
        title: custom.title,
      })
    );

    setCustom({
      mode: "",
      primary: theme.primary,
      secondary: theme.secondary,
      background: theme.background,
      text: theme.text,
      title: theme.title,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        🎨 Select Palette
      </Typography>

      {/* 🔹 Standard Palettes */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <PaletteCardPreview
          mode="Blue"
          primary="#1E56A0"
          secondary="#266DCB"
          background="#FBFDFE"
          text="#333"
          title="#1E56A0"
          onClick={() => dispatch(switchPalette("blue"))}
        />
        <PaletteCardPreview
          mode="Red"
          primary="#B10C2E"
          secondary="#6E0715"
          background="#F6F6F6"
          text="#2E2E2E"
          title="#B10C2E"
          onClick={() => dispatch(switchPalette("red"))}
        />

        {customPalette.map((p, index) => (
          <PaletteCardPreview
            key={index}
            mode={p.mode}
            primary={p.primary}
            secondary={p.secondary}
            background={p.background}
            text={p.text}
            title={p.title ? p.title : ""}
            onClick={() =>
              dispatch(
                setPalette({
                  mode: "custom",
                  primary: p.primary,
                  secondary: p.secondary,
                  background: p.background,
                  text: p.text,
                  title: p.title,
                })
              )
            }
          />
        ))}
      </Box>

      {/* 🔹 Create Custom Palette */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Custom Palette
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          label="Mode"
          value={custom.mode}
          onChange={(e) => setCustom({ ...custom, mode: e.target.value })}
        />
        <TextField
          label="Primary"
          value={custom.primary}
          onChange={(e) => setCustom({ ...custom, primary: e.target.value })}
        />
        <TextField
          label="Secondary"
          value={custom.secondary}
          onChange={(e) => setCustom({ ...custom, secondary: e.target.value })}
        />
        <TextField
          label="Background"
          value={custom.background}
          onChange={(e) => setCustom({ ...custom, background: e.target.value })}
        />
        <TextField
          label="Text"
          value={custom.text}
          onChange={(e) => setCustom({ ...custom, text: e.target.value })}
        />
        <TextField
          label="Title"
          value={custom.title}
          onChange={(e) => setCustom({ ...custom, title: e.target.value })}
        />
      </Box>

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveCustom}>
        Save Custom Palette
      </Button>
    </Box>
  );
}
