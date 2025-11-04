"use client";
import { useDispatch, useSelector } from "react-redux";
import { switchPalette, setPalette } from "@/redux/slices/paletteSlice";
import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { RootState } from "@/redux/store";

export default function Settings() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.palette);

  const [custom, setCustom] = useState(theme);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎨 Select Palette</h2>
      <Button
        onClick={() => dispatch(switchPalette("blue"))}
        variant="contained"
        color="primary"
        sx={{ mr: 2 }}
      >
        Blue
      </Button>
      <Button
        onClick={() => dispatch(switchPalette("red"))}
        variant="contained"
        color="secondary"
      >
        Red
      </Button>

      <h3 style={{ marginTop: 30 }}>Custom Palette</h3>
      <TextField
        label="Primary"
        value={custom.primary}
        onChange={(e) => setCustom({ ...custom, primary: e.target.value })}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Secondary"
        value={custom.secondary}
        onChange={(e) => setCustom({ ...custom, secondary: e.target.value })}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Background"
        value={custom.background}
        onChange={(e) => setCustom({ ...custom, background: e.target.value })}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Text"
        value={custom.text}
        onChange={(e) => setCustom({ ...custom, text: e.target.value })}
        sx={{ mr: 2 }}
      />
      <TextField
        label="Title"
        value={custom.title}
        onChange={(e) => setCustom({ ...custom, title: e.target.value })}
        sx={{ mr: 2 }}
      />

      <div style={{ marginTop: 20 }}>
        <Button
          variant="outlined"
          onClick={() => dispatch(setPalette({ ...custom, mode: "custom" }))}
        >
          Save Custom Palette
        </Button>
      </div>
    </div>
  );
}
