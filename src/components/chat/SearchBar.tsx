"use client";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { RootState, useAppSelector } from "@/redux/store";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const theme = useAppSelector((state: RootState) => state.palette);

  return (
    <TextField
      fullWidth
      placeholder="Search on conversation..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "gray", fontSize: 20 }} />
          </InputAdornment>
        ),
      }}
      sx={{
        borderRadius: 3,
        bgcolor: theme.currentPalette.background,
        color: theme.currentPalette.primary,
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          bgcolor: theme.currentPalette.background,
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
    />
  );
};
