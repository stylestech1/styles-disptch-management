import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Palette = {
  mode: "blue" | "red" | "custom";
  primary: string;
  secondary: string;
  background: string;
  text: string;
  title: string;
};

const bluePalette: Palette = {
  mode: "blue",
  primary: "#1E56A0",
  secondary: "#266DCB",
  background: "#FBFDFE",
  text: "#333333",
  title: "#1E56A0",
};

const redPalette: Palette = {
  mode: "red",
  primary: "#B10C2E",
  secondary: "#6E0715",
  background: "#F6F6F6",
  text: "#2E2E2E",
  title: "#B10C2E",
};

const initialState: Palette = bluePalette;

const paletteSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setPalette(state, action: PayloadAction<Palette>) {
      return action.payload;
    },
    switchPalette(state, action: PayloadAction<"blue" | "red">) {
      return action.payload === "blue" ? bluePalette : redPalette;
    },
  },
});

export const { setPalette, switchPalette } = paletteSlice.actions;
export default paletteSlice.reducer;
