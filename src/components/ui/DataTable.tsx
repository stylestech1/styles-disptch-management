"use client";
import React, { ReactNode } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  Typography,
  Skeleton,
  alpha,
} from "@mui/material";
import { RootState, useAppSelector } from "@/redux/store";
import { usePathname } from "next/navigation";

export type AlignType = "left" | "center" | "right";

export interface Column {
  key: string;
  header: string;
  align?: AlignType;
  width?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  className?: string;
}

const DataTable = <T,>({
  columns,
  data,
  renderRow,
  emptyState,
  loading = false,
  className = "",
}: DataTableProps<T>) => {

  const theme = useAppSelector((state: RootState) => state.palette)
  const pathname = usePathname()

  if (loading) {
    return (
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
        className={className}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || "center"}
                    sx={{ fontWeight: 600, color: "text.secondary" }}
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton variant="rectangular" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  const defaultEmptyState = (
    <TableRow>
      <TableCell
        colSpan={columns.length}
        align="center"
        sx={{ py: 6, color: "text.secondary" }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          {
            pathname.endsWith('customers') ? (
              <Typography variant="h4">🤵</Typography>
            ): (
              <Typography variant="h4">📦</Typography>
            )
          }
          <Typography variant="body1">No records found</Typography>
          <Typography variant="body2" color="text.disabled">
            Get started by creating your first record
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflowX: "auto",
        bgcolor: "background.paper",
      }}
      className={className}
    >
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "action.hover"}}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || "center"}
                  sx={{
                    fontWeight: 600,
                    color: theme.primary,
                    borderBottom: 1,
                    borderColor: theme.primary,
                    backgroundColor: alpha(theme.primary, 0.1),
                    width: column.width,
                    py:2
                  }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length > 0
              ? data.map((item, index) => renderRow(item, index))
              : emptyState || defaultEmptyState}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataTable;
