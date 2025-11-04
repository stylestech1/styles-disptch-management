"use client";
import { TPaletteConfig } from "@/theme/palettes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: { palette: TPaletteConfig } = {
  palette: {
    mode: "light",
    primary: {
      main: "#1E56A0",
      contrastText: "#FBFDFE",
    },
    secondary: {
      main: "#266DCB",
      contrastText: "#F6F6F6",
    },
    background: {
      default: "#1E56A0",
      paper: "#FBFDFE",
    },
    text: {
      primary: "#333",
      secondary: "#FBFDFE",
    },
  },
};

const paletteSlice = createSlice({
  name: "palette",
  initialState,
  reducers: {
    setPalette: (state, action: PayloadAction<TPaletteConfig>) => {
      state.palette = action.payload;
    },
  },
});

export const { setPalette } = paletteSlice.actions;
export default paletteSlice.reducer;
