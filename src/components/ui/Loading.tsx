"use client";
import { RootState, useAppSelector } from "@/redux/store";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  const theme = useAppSelector((state: RootState) => state.palette);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        gap: 2,
      }}
    >
      <CircularProgress
        size={50}
        thickness={5}
        sx={{
          color: theme.primary,
        }}
      />
      <Typography variant="h6" color={theme.primary}>
        Loading...
      </Typography>
    </Box>
  );
}
