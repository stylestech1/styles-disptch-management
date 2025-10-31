"use client";
import React, { useCallback, useState } from "react";
import Erros from "@/components/ui/Erros";
import { useAppSelector } from "@/redux/store";
import { TTruck } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import { IoAdd, IoPencil, IoTrash, IoSearch } from "react-icons/io5";
import {
  Dialog,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import { muiTheme } from "@/theme/theme";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Pagination from "@/components/ui/Pagination";
import {
  useCreateTruckMutation,
  useDeleteTruckMutation,
  useGetAllDriversQuery,
  useGetAllTrucksQuery,
  useGetTrucksWithSearchQuery,
  useGetTruckWithSearchQuery,
  useUpdateTruckMutation,
} from "@/redux/slices/apiSlice";
import { TruckForm } from "@/components/truck/TruckForm";
import StatsCard from "@/components/ui/StatsCard";
import { FaTruck, FaUserCheck, FaUserMinus } from "react-icons/fa";
import { FaUserLargeSlash } from "react-icons/fa6";
import { Dayjs } from "dayjs";
import { useSearch } from "@/hook/useSearch";
import useError from "@/hook/useError";
import { StatusChip, StyledTableCell, StyledTableRow } from "@/components/ui/TablesMUI";

/* ---------------- TrucksPage (parent) ---------------- */
const TrucksPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [deleteToast, setDeleteToast] = useState({ open: false, message: "" });
  const { error, setError } = useError();

  // RTK Query
  const {
    data: trucksData,
    isLoading,
    refetch,
  } = useGetTrucksWithSearchQuery({ page: page + 1 });
  const { data: allTrucksData } = useGetAllTrucksQuery({ skip: !token });
  const { data: driversData } = useGetAllDriversQuery();
  const { data: filteredData } = useGetTruckWithSearchQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
    },
    { skip: !isFiltered }
  );

  // Mutations
  const [createTruck, { isLoading: isCreating }] = useCreateTruckMutation();
  const [updateTruck, { isLoading: isUpdating }] = useUpdateTruckMutation();
  const [deleteTruck, { isLoading: isDeleting }] = useDeleteTruckMutation();

  // convenient exposures
  const trucks = isFiltered
    ? filteredData?.trucksData?.data?.data || []
    : trucksData?.data?.data || [];
  const allTrucks = allTrucksData?.data?.data || [];
  const pagination = allTrucksData?.data?.paginationResult || null;
  const allDrivers = driversData?.data || [];

  // Filter and Search loads
  const { filteredData: searchedTrucks } = useSearch({
    data: trucks,
    searchFields: [
      "truckId",
      "model",
      "plateNumber",
      "assignedDriver.driverId",
      "assignedDriver.name",
    ],
    initialSearch: searchInput,
  });
  const tableData = searchInput ? searchedTrucks : trucks;

  // Modal states
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TTruck>>({});
  const [editMode, setEditMode] = useState(false);

  // Delete flow state
  const [truckToDelete, setTruckToDelete] = useState<{
    id: string;
    truckId?: number;
  } | null>(null);

  // HANDLE open add
  const handleOpenAdd = useCallback(() => {
    setFormData({});
    setEditMode(false);
    setOpen(true);
  }, []);

  // HANDLE edit click
  const handleEditClick = useCallback((truck: TTruck) => {
    const assignedDriverId =
      typeof truck.assignedDriver === "object"
        ? truck.assignedDriver.id
        : truck.assignedDriver;
    setFormData({
      id: truck.id,
      model: truck.model,
      plateNumber: truck.plateNumber,
      type: truck.type,
      year: truck.year,
      capacity: truck.capacity,
      fuelPerMile: truck.fuelPerMile,
      status: truck.status,
      assignedDriver: assignedDriverId,
    });
    setEditMode(true);
    setOpen(true);
  }, []);

  // form change
  const handleFormChange = useCallback(
    <K extends keyof TTruck>(field: K, value: TTruck[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Create truck
  const handleCreate = useCallback(async () => {
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }
    try {
      await createTruck({
        ...formData,
        createdBy: user.id,
      }).unwrap();

      toast.success("✅ Truck created successfully!");
      setOpen(false);
      try {
        refetch();
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Creating truck failed ❌");
    }
  }, [createTruck, formData, user?.id, refetch]);

  // Update truck
  const handleUpdate = useCallback(async () => {
    if (!formData?.id) {
      toast.error("Missing truck ID");
      return;
    }
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }
    try {
      await updateTruck({
        id: formData.id,
        ...formData,
        updatedBy: user.id,
      }).unwrap();

      toast.success("✅ Truck updated successfully!");
      setOpen(false);
      try {
        refetch();
      } catch {}
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Updating truck failed ❌");
    }
  }, [updateTruck, formData, user?.id, refetch]);

  // Delete flow
  const handleDelete = useCallback((id: string, truckId?: number) => {
    setDeleteToast({
      open: true,
      message: `Are you sure you want to delete truck #${truckId}?`,
    });
    setTruckToDelete({ id, truckId });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!truckToDelete) return;
    try {
      await deleteTruck(truckToDelete.id).unwrap();
      toast.success(`✅ Truck #${truckToDelete.truckId} deleted successfully!`);
      try {
        refetch();
      } catch {}
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Deleting truck failed ❌");
    } finally {
      setDeleteToast({ open: false, message: "" });
      setTruckToDelete(null);
    }
  }, [truckToDelete, deleteTruck, refetch]);

  const cancelDelete = useCallback(() => {
    setDeleteToast({ open: false, message: "" });
    setTruckToDelete(null);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {/* Title */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          [muiTheme.breakpoints.down("md")]: {
            flexDirection: "column",
            gap: 2,
            alignItems: "stretch",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Titles>Truck Management</Titles>
          <p className="text-slate-600 text-md">
            Manage your trucks and their access
          </p>
        </Box>
      </Box>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10">
        <StatsCard
          title="Total Trucks"
          value={tableData.length || 0}
          icon={FaTruck}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />

        <StatsCard
          title="Available"
          value={
            tableData.filter((d: TTruck) => d.status === "available").length
          }
          icon={FaUserCheck}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />

        <StatsCard
          title="Busy"
          value={tableData.filter((d: TTruck) => d.status === "busy").length}
          icon={FaUserMinus}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />

        <StatsCard
          title="Inactive"
          value={
            tableData.filter((d: TTruck) => d.status === "inactive").length
          }
          icon={FaUserLargeSlash}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
          loading={isLoading}
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenAdd}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 py-3 px-8 cursor-pointer text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200 rounded-lg font-bold text-lg whitespace-nowrap w-full lg:w-auto"
        >
          <IoAdd size={25} />
          {isLoading ? "Loading..." : "Add Truck"}
        </button>
      </div>

      {/* Search */}
      <div className="w-full flex items-end gap-2 p-4 border border-gray-200 rounded-lg shadow-sm my-10">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Truck Id, Model, Plate Number, Driver ID, or Driver name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          overflowX: "auto",
          maxWidth: "100%",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-track": {
            background: muiTheme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            background: muiTheme.palette.grey[400],
            borderRadius: 4,
          },
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="trucks table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Truck ID</StyledTableCell>
              <StyledTableCell>Model</StyledTableCell>
              <StyledTableCell>Plate Number</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Year</StyledTableCell>
              <StyledTableCell>Capacity (kg)</StyledTableCell>
              <StyledTableCell>Fuel/Mile</StyledTableCell>
              <StyledTableCell>Driver</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  No trucks found
                </StyledTableCell>
              </TableRow>
            ) : (
              tableData.map((truck: TTruck) => (
                <StyledTableRow key={truck.id}>
                  <StyledTableCell component="th" scope="row">
                    {truck.truckId}
                  </StyledTableCell>
                  <StyledTableCell>{truck.model}</StyledTableCell>
                  <StyledTableCell>{truck.plateNumber}</StyledTableCell>
                  <StyledTableCell>{truck.type}</StyledTableCell>
                  <StyledTableCell>{truck.year}</StyledTableCell>
                  <StyledTableCell>{truck.capacity}</StyledTableCell>
                  <StyledTableCell>
                    {truck.fuelPerMile ?? "N/A"}
                  </StyledTableCell>
                  <StyledTableCell>
                    {typeof truck.assignedDriver === "object"
                      ? truck.assignedDriver.name
                      : truck.assignedDriver || "Unassigned"}
                    {typeof truck.assignedDriver === "object" &&
                      truck.assignedDriver.driverId && (
                        <Box
                          component="span"
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            display: "block",
                          }}
                        >
                          ID: {truck.assignedDriver.driverId}
                        </Box>
                      )}
                  </StyledTableCell>
                  <StyledTableCell>
                    <StatusChip status={truck.status} />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Tooltip title="Edit Truck">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(truck)}
                          disabled={isUpdating}
                        >
                          <IoPencil />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Truck">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(truck.id, truck.truckId)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <CircularProgress size={16} />
                          ) : (
                            <IoTrash />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && tableData.length > 0 && (
        <Pagination
          pagination={pagination}
          page={page}
          setPage={setPage}
          pageSize={10}
          showInfo={true}
        />
      )}

      {/* Truck Form*/}
      <TruckForm
        open={open}
        onClose={() => setOpen(false)}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={editMode ? handleUpdate : handleCreate}
        editMode={editMode}
        isLoading={isCreating || isUpdating}
        allDrivers={allDrivers}
        allTrucks={allTrucks}
      />

      {/* Delete Confirmation */}
      {deleteToast.open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(2px)",
            zIndex: 1299,
          }}
        />
      )}

      <Dialog
        open={deleteToast.open}
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            minWidth: 300,
            maxWidth: 400,
            margin: 2,
          },
        }}
        sx={{
          zIndex: 1300,
          "& .MuiDialog-container": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Confirm Delete
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            {deleteToast.message}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={cancelDelete}
              sx={{
                borderRadius: 1,
                minWidth: 80,
                borderColor: "grey.400",
                "&:hover": {
                  borderColor: "grey.600",
                  backgroundColor: "grey.50",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              sx={{
                borderRadius: 1,
                minWidth: 80,
                backgroundColor: "error.main",
                "&:hover": { backgroundColor: "error.dark" },
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default TrucksPage;
