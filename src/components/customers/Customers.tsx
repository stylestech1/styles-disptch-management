"use client";
import React, { useEffect, useMemo, useState } from "react";
import { RootState, useAppSelector } from "@/redux/store";
import { TCustomer } from "@/types/globalTypes";
import Titles from "@/components/ui/Titles";
import Loading from "@/components/ui/Loading";
import toast, { Toaster } from "react-hot-toast";
import Erros from "@/components/ui/Erros";
import { IoAdd, IoPencil, IoSearch, IoPerson } from "react-icons/io5";
import {
  Button,
  TableRow,
  Box,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  alpha,
} from "@mui/material";

import { muiTheme } from "@/theme/theme";
import { getErrorMessage } from "@/utils/getErrorMessage";
import Pagination from "@/components/ui/Pagination";
import {
  useCreateCustomerMutation,
  useGetCustomersQuery,
  useGetCustomersWithPaginationQuery,
  useGetCustomerWithFilterQuery,
  useUpdateCustomerMutation,
} from "@/redux/slices/apiSlice";
import useError from "@/hook/useError";
import StatsCard from "@/components/ui/StatsCard";
import { Dayjs } from "dayjs";
import { useSearch } from "@/hook/useSearch";
import DataTable from "@/components/ui/DataTable";
import { CustomerForm } from "./CustomerForm";
import { customerColumns } from "@/data/customerTables";

const CustomerPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const { error, setError } = useError();
  const theme = useAppSelector((state: RootState) => state.palette);

  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  // 🔹 API Queries
  const {
    data: allCustomersData,
    isLoading: allCustomersLoading,
    error: allCustomersError,
  } = useGetCustomersQuery(undefined, {skip: !token})
  const {
    data: customersData,
    isLoading: customersLoading,
    error: customerError,
    refetch,
  } = useGetCustomersWithPaginationQuery({ page, limit: 10 }, { skip: !token });

  const { data: filteredData } = useGetCustomerWithFilterQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
    },
    { skip: !isFiltered }
  );

  // 🔹 API Mutations
  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const [originalData, setOriginalData] = useState<Partial<TCustomer>>({});

  const displayCustomer = isFiltered
    ? filteredData?.customersData?.data || []
    : customersData?.data || [];

  const pagination = isFiltered
    ? filteredData?.customersData?.paginationResult
    : customersData?.paginationResult;

  const isLoading = customersLoading;

  // Filter and Search loads
  const { filteredData: searchedCustomer } = useSearch({
    data: displayCustomer,
    searchFields: ["customerId", "name", "phone", "email"],
    initialSearch: searchInput,
  });
  const tableData = searchInput ? searchedCustomer : displayCustomer;

  // StatsCard
  const statsData = useMemo(() => {

    return {
      totalCustomers: tableData.length,
    };
  }, [tableData]);

  // ✅ Modal States
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TCustomer>>({});
  const [editMode, setEditMode] = useState(false);

  // ✅ Handle Open (Add / Edit)
  const handleOpenAdd = () => {
    setFormData({});
    setEditMode(false);
    setOpen(true);
  };

  // ✅ Handle Edit
  const handleEditClick = (customer: TCustomer) => {
    setOriginalData(customer);
    setFormData({
      id: customer.id,
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      feedback: customer.feedback,
      type: customer.type,
    });
    setEditMode(true);
    setOpen(true);
  };

  // ✅ Handle Form Change
  const handleFormChange = <K extends keyof TCustomer>(
    field: K,
    value: TCustomer[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getChangedFields = (
    original: Partial<TCustomer>,
    updated: Partial<TCustomer>
  ): Partial<TCustomer> => {
    const changedFields: Record<string, unknown> = {};

    Object.entries(updated).forEach(([key, value]) => {
      const k = key as keyof TCustomer;
      if (value !== original[k] && value !== undefined) {
        changedFields[key] = value;
      }
    });

    return changedFields as Partial<TCustomer>;
  };

  // handling Errors
  useEffect(() => {
    if (customerError) {
      const errorMessage = getErrorMessage(customerError);
      if (error !== errorMessage) {
        setError(errorMessage);
        toast.error(errorMessage || "Loading failed ❌", {
          id: "customerError",
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  }, [customerError, setError, error]);

  // ✅ Create Driver
  const handleCreate = async () => {
    if (!user?.id) {
      toast.error("User not found!");
      return;
    }

    try {
      await createCustomer({
        ...formData,
        addedBy: user.id,
      }).unwrap();
      toast.success("✅ Customer created successfully!");
      setOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Creating customer failed ❌");
      throw err;
    }
  };

  // ✅ Update Driver
  const handleUpdate = async () => {
    if (!formData?.id) {
      toast.error("Missing driver ID");
      return;
    }

    const changedFields = getChangedFields(originalData, formData);

    if (Object.keys(changedFields).length === 0) {
      toast("⚠️ No changes detected.");
      return;
    }

    try {
      await updateCustomer({
        id: formData.id,
        body: changedFields,
      }).unwrap();
      toast.success("✅ Customer updated successfully!");
      setOpen(false);
      refetch();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Updating customer failed ❌");
      throw err;
    }
  };

  // ✅ Render Table Row - Similar to LoadsPage
  const renderCustomerRow = (customer: TCustomer, index: number) => {
    return (
      <TableRow
        sx={{
          "&:hover": {
            backgroundColor: alpha(theme.currentPalette.primary, 0.05),
          },
        }}
        key={index}
        className="transition-colors group"
      >
        {/* Driver ID */}
        <td className="p-4 text-center">
          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
            {customer.customerId}
          </span>
        </td>

        {/* Name */}
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
              <IoPerson size={12} className="text-slate-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">
                {customer.name || "-"}
              </div>
              <div className="text-xs text-slate-500">
                {customer.email || "-"}
              </div>
              <div className="text-xs text-slate-500">
                {customer.phone || "-"}
              </div>
            </div>
          </div>
        </td>

        {/* Address */}
        <td className="p-4 text-center text-slate-700">
          {customer.address || "-"}
        </td>

        {/* feedback */}
        <td className="p-4 text-center font-semibold text-emerald-700">
          {customer.feedback}
        </td>

        {/* Type */}
        <td className="p-4 text-center">
          <Chip label={customer.type} variant="outlined" size="small" />
        </td>

        {/* Actions */}
        <td className="p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="Edit Customer">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(customer);
                }}
                sx={{
                  color: theme.currentPalette.primary,
                  "&:hover": {
                    backgroundColor: alpha(theme.currentPalette.primary, 0.1),
                  },
                }}
              >
                <IoPencil size={16} />
              </IconButton>
            </Tooltip>
          </div>
        </td>
      </TableRow>
    );
  };

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
          <Titles>Customers Services</Titles>
          <p className="text-slate-600 text-md">
            Handle your customers with love
          </p>
        </Box>
      </Box>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10">
        <StatsCard
          title="Total Customers"
          value={statsData.totalCustomers}
          icon={IoPerson}
          iconColor={theme.currentPalette.primary}
          loading={isLoading}
        />
      </div>

      {/* Add Button */}
      <Box display="flex" justifyContent="end" sx={{ mt: 2 }}>
        <Button
          onClick={handleOpenAdd}
          disabled={isLoading}
          variant="contained"
          startIcon={<IoAdd size={22} />}
          sx={{
            py: 1.5,
            px: 4,
            fontWeight: "bold",
            fontSize: "1rem",
            borderRadius: 2,
            textTransform: "none",
            width: { xs: "100%", lg: "auto" },
            background: `linear-gradient(to right, ${theme.currentPalette.primary}, ${theme.currentPalette.secondary})`,
            color: "#fff",
            "&:hover": {
              background: `linear-gradient(to right, ${theme.currentPalette.secondary}, ${theme.currentPalette.primary})`,
            },
            transition: "all 0.3s ease",
          }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Search & Filter */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "end",
          gap: 2,
          p: 2,
          my: 5,
          border: `1px solid ${theme.currentPalette.primary}33`,
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          backgroundColor: theme.currentPalette.background,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search drivers by ID, name, phone, email, or license number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearch size={20} color="#9ca3af" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "#e5e7eb" },
              "&:hover fieldset": { borderColor: theme.currentPalette.primary },
              "&.Mui-focused fieldset": {
                borderColor: theme.currentPalette.primary,
              },
            },
            "& input": {
              color: theme.currentPalette.text,
            },
          }}
        />
      </Box>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Table For Customer - Using DataTable Component */}
      <DataTable
        columns={customerColumns}
        data={tableData}
        renderRow={renderCustomerRow}
        loading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        page={page}
        setPage={setPage}
        pageSize={10}
        showInfo={true}
      />

      {/* Driver Form Modal */}
      <CustomerForm
        open={open}
        onClose={() => setOpen(false)}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={editMode ? handleUpdate : handleCreate}
        editMode={editMode}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
};

export default CustomerPage;
