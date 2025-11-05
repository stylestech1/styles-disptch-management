import { Palette, TPaletteConfig } from "@/types/themeType";
import { PaletteMode } from "@mui/material";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const bluePalette: Palette = {
  mode: "light",
  customName: "Blue",
  primary: "#1E56A0",
  secondary: "#266DCB",
  background: "#FBFDFE",
  text: "#333333",
  title: "#1E56A0",
};

const redPalette: Palette = {
  mode: "light", 
  customName: "Red",
  primary: "#B10C2E",
  secondary: "#6E0715",
  background: "#F6F6F6",
  text: "#2E2E2E",
  title: "#B10C2E",
};

interface PaletteState {
  currentPalette: Palette;
  customPalettes: Palette[];
  isLoading: boolean;
}

const initialState: PaletteState = {
  currentPalette: bluePalette,
  customPalettes: [],
  isLoading: false,
};

const paletteSlice = createSlice({
  name: "palette",
  initialState,
  reducers: {
    setPalette(state, action: PayloadAction<Palette>) {
      state.currentPalette = action.payload;
    },
    switchPalette(state, action: PayloadAction<"blue" | "red">) {
      state.currentPalette = action.payload === "blue" ? bluePalette : redPalette;
    },
    addCustomPalette(state, action: PayloadAction<Palette>) {
      // Remove existing palette with same customName if exists
      state.customPalettes = state.customPalettes.filter(
        p => p.customName !== action.payload.customName
      );
      state.customPalettes.push(action.payload);
    },
    removeCustomPalette(state, action: PayloadAction<string>) {
      state.customPalettes = state.customPalettes.filter(
        p => p.customName !== action.payload
      );
    },
    setPaletteMode(state, action: PayloadAction<PaletteMode>) {
      state.currentPalette.mode = action.payload;
    },
  },
});

export const {
  setPalette,
  switchPalette,
  addCustomPalette,
  removeCustomPalette,
  setPaletteMode,
} = paletteSlice.actions;
export default paletteSlice.reducer;