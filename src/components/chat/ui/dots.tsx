'use client'
import { RootState, useAppSelector } from "@/redux/store";
import { Box } from "@mui/material";

const Dots = () => {
  const theme = useAppSelector((state: RootState) => state.palette)

  const dotStyle = (delay: string) => ({
    width: 8,
    height: 8,
    bgcolor: theme.currentPalette.primary,
    borderRadius: "50%",
    display: "inline-block",
    animation: "dot 1.5s infinite",
    animationDelay: delay,
    "@keyframes dot": {
      "0%, 20%": { opacity: 0, transform: "translateY(0)" },
      "50%": { opacity: 1, transform: "translateY(-4px)" },
      "100%": { opacity: 0, transform: "translateY(0)" },
    },
  });

  return (
    <Box display="flex" alignItems="center" p={1}>
      <Box
        sx={{
          bgcolor: "grey.100",
          borderRadius: "16px 16px 16px 0px",
          p: 2,
          display: "flex",
          gap: 0.5,
        }}
      >
        <Box sx={dotStyle("0s")} />
        <Box sx={dotStyle("0.3s")} />
        <Box sx={dotStyle("0.6s")} />
      </Box>
    </Box>
  );
};

export default Dots;
