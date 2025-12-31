import { Typography } from "@mui/material";
import React from "react";

const progress = () => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Progress
        </Typography>
        {/* <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: theme.currentPalette.primary,
          }}
        >
          {activeTab}/3
        </Typography> */}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${(activeTab / 3) * 100}%` }}
        /> */}
      </div>
    </div>
  );
};

export default progress;
