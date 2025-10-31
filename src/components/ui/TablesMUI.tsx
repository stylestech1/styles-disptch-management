import { Box, Chip, Skeleton, styled, TableBody, TableCell, TableRow } from "@mui/material";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${theme.components?.MuiTableCell?.styleOverrides?.root}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '&[class*="MuiTableCell-head"]': {
    backgroundColor: "#f8fafc",
    color: "#56677a",
    fontSize: 14,
  },
  '&[class*="MuiTableCell-body"]': {
    fontSize: 14,
  },
}));
export const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: "#fcf9fa",
  },
}));
export const StatusChip = ({ status }: { status: string }) => {
  const getColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "busy":
        return "error";
      default:
        return "default";
    }
  };

  return <Chip label={status} color={getColor(status)} size="small" />;
};


// Skeleton Loader Component
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton variant="text" width={20} />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={18} height={18} />
            <Skeleton variant="text" width={80} />
          </Box>
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={80} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={60} />
        </TableCell>
        <TableCell align="right">
          <Skeleton variant="text" width={80} />
        </TableCell>
        <TableCell align="center">
          <Skeleton variant="rectangular" width={80} height={32} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);