"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoAdd,
  IoSearch,
  IoPerson,
  IoBriefcase,
  IoKey,
  IoSettingsOutline,
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TDispatcher } from "@/types/globalTypes";
import useError from "@/hook/useError";
import Pagination from "@/components/ui/Pagination";
import DataTable from "@/components/ui/DataTable";
import { dispatcherColumns } from "@/data/dispatcherTables";
import StatsCard from "@/components/ui/StatsCard";
import {
  useGetAllDispatchersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserWithSearchQuery,
} from "@/redux/slices/apiSlice";
import { getErrorMessage } from "@/utils/getErrorMessage";
import UserSettingsModal from "@/components/users/UserSettingsModal";
import CreateUserModal from "@/components/users/CreateUserModal";
import { Dayjs } from "dayjs";
import { useSearch } from "@/hook/useSearch";
import {
  alpha,
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

const Users = () => {
  const [popup, setPopup] = useState(false);
  const [popupSetting, setPopupSetting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TDispatcher | null>(null);
  const [page, setPage] = useState(1);

  // ✅ Search And Filter
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const { error, setError } = useError();
  const theme = useAppSelector((state: RootState) => state.palette);

  // RTK Querys
  const {
    data: dispatchersData,
    error: dispatchersError,
    isLoading: loading,
    isFetching,
    refetch,
  } = useGetAllDispatchersQuery(
    { page, limit: 10 },
    {
      skip: !token,
    }
  );
  const { data: filteredData } = useGetUserWithSearchQuery(
    {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : undefined,
      to: toDate ? toDate.format("YYYY-MM-DD") : undefined,
    },
    { skip: !isFiltered }
  );

  // RTK Mutation
  const [createUser, { isLoading: creatingUser }] = useCreateUserMutation();
  const [updateUserRole, { isLoading: updatingRole }] =
    useUpdateUserRoleMutation();
  const [activateUser, { isLoading: activating }] = useActivateUserMutation();
  const [deactivateUser, { isLoading: deactivating }] =
    useDeactivateUserMutation();

  // Export Data

  const dispatchers = isFiltered
    ? filteredData?.dispatchersData?.data || []
    : dispatchersData?.data || [];
  const pagination = dispatchersData?.paginationResult || null;

  // Token Checking
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }
  }, [token, router]);

  // handling Errors
  useEffect(() => {
    if (dispatchersError) {
      const errorMessage = getErrorMessage(dispatchersError);
      if (error !== errorMessage) {
        setError(errorMessage);
        toast.error(errorMessage || "Loading failed ❌", {
          id: "dispatchersError",
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  }, [dispatchersError, setError, error]);

  // Refetching when mounting or updating
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [page, token]);

  // Filter and Search loads
  const { filteredData: searchedDispatchers } = useSearch({
    data: dispatchers,
    searchFields: ["jobId", "name", "phone", "email"],
    initialSearch: searchInput,
  });
  const tableData = searchInput ? searchedDispatchers : dispatchers;

  // FIXME: Create User
  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    position: string;
    password: string;
    passwordConfirmation: string;
  }) => {
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      await createUser(userData).unwrap();
      toast.success("User created successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });
      setPopup(false);
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Creating user failed ❌");
      throw err;
    }
  };

  // FIXME: Update User Role
  const handleUpdateRole = async (
    userId: string,
    newRole: "admin" | "employee" | "driver"
  ) => {
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
      toast.success(`Role updated to ${newRole} successfully!`, {
        style: { background: "#16a34a", color: "#fff" },
      });
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Updating role failed ❌");
      throw err;
    }
  };

  // FIXME: Activate User
  const handleActivateUser = async (userId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      await activateUser({ id: userId }).unwrap();
      toast.success("User activated successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Activating user failed ❌");
      throw err;
    }
  };

  // FIXME: Deactivate User
  const handleDeactivateUser = async (userId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      await deactivateUser({ id: userId }).unwrap();
      toast.success("User deactivated successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Deactivating user failed ❌");
      throw err;
    }
  };

  // TODO: Function to open settings popup
  const openSettingsPopup = (user: TDispatcher) => {
    setSelectedUser(user);
    setPopupSetting(true);
  };

  // TODO: Close settings popup
  const closeSettingsPopup = () => {
    setPopupSetting(false);
    setSelectedUser(null);
  };

  // TODO: Close create user popup
  const closeCreateUserPopup = () => {
    setPopup(false);
  };

  // TODO: Table
  const renderDispatcherRow = (dispatcher: TDispatcher, index: number) => (
    <tr
      key={dispatcher.id}
      className="hover:bg-slate-50 transition-colors group"
    >
      {/* # */}
      <td className="p-4 text-slate-600 font-medium">{index + 1}</td>

      {/* Name */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <IoPerson size={14} className="text-slate-600" />
          </div>
          <span className="font-medium text-slate-900">{dispatcher.name}</span>
        </div>
      </td>

      {/* Email */}
      <td className="p-4 text-slate-700">{dispatcher.email}</td>

      {/* Phone */}
      <td className="p-4 text-slate-700">{dispatcher.phone}</td>

      {/* Role */}
      <td className="p-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            dispatcher.role === "admin"
              ? "bg-purple-100 text-purple-800 border border-purple-200"
              : "bg-slate-100 text-slate-800 border border-slate-200"
          }`}
        >
          {dispatcher.role}
        </span>
      </td>

      {/* Position */}
      <td className="p-4 text-slate-700">{dispatcher.position}</td>

      {/* Job ID */}
      <td className="p-4">
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
          {dispatcher.jobId}
        </span>
      </td>

      {/* Status */}
      <td className="p-4 text-center">
        {dispatcher.active ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Active
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            Inactive
          </span>
        )}
      </td>

      {/* Setting */}
      <td className="p-4">
        <button
          onClick={() => openSettingsPopup(dispatcher)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-800 hover:text-blue-200 transition-colors"
        >
          <IoSettingsOutline />
          <span>view setting</span>
        </button>
      </td>
    </tr>
  );

  // set loading
  if (loading && dispatchers.length === 0) return <Loading />;

  return (
    <section className="relative p-6">
      {/* Title */}
      <Box
        component="div"
        className="flex flex-col xl:items-start xl:justify-between gap-1"
      >
        <Typography
          sx={{ color: theme.text, fontSize: "45px", fontWeight: "bold" }}
        >
          Dispatcher Management
        </Typography>
        <Typography sx={{ color: alpha(theme.text, 0.7), fontSize: "16px" }}>
          Manage your dispatch team members and their access
        </Typography>
      </Box>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-10">
        <StatsCard
          title="Total Dispatchers"
          value={dispatchers.length || 0}
          icon={IoPerson}
          iconColor={theme.primary}
          loading={loading}
        />

        <StatsCard
          title="Active"
          value={dispatchers.filter((d: TDispatcher) => d.active).length}
          icon={IoBriefcase}
          iconColor={theme.primary}
          loading={loading}
        />

        <StatsCard
          title="Admins"
          value={
            dispatchers.filter((d: TDispatcher) => d.role === "admin").length
          }
          icon={IoKey}
          iconColor={theme.primary}
          loading={loading}
        />

        <StatsCard
          title="Employees"
          value={
            dispatchers.filter((d: TDispatcher) => d.role === "employee").length
          }
          icon={IoPerson}
          iconColor={theme.primary}
          loading={loading}
        />
      </div>

      {/* Add User */}
      <Box display="flex" justifyContent="end" sx={{ mt: 2 }}>
        <Button
          onClick={() => setPopup(true)}
          variant="contained"
          startIcon={<IoAdd size={22} />}
          disabled={loading}
          sx={{
            py: 1.5,
            px: 4,
            fontWeight: "bold",
            fontSize: "1rem",
            borderRadius: 2,
            textTransform: "none",
            width: { xs: "100%", lg: "auto" },
            background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
            color: "#fff",
            "&:hover": {
              background: `linear-gradient(to right, ${theme.secondary}, ${theme.primary})`,
            },
            transition: "all 0.3s ease",
          }}
        >
          New User
        </Button>
      </Box>

      <Toaster position="top-right" reverseOrder={false} />

      {/* Search & Filter */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "end",
          gap: 2,
          p: 2,
          my: 5,
          border: `1px solid ${theme.primary}33`,
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          backgroundColor: theme.background,
        }}
      >
        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search loads by ID or driver number"
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
              "&:hover fieldset": { borderColor: theme.primary },
              "&.Mui-focused fieldset": { borderColor: theme.primary },
            },
            "& input": {
              color: theme.text,
            },
          }}
        />
      </Box>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Table */}
      {(loading || isFetching) && dispatchers.length === 0 ? (
        <Loading />
      ) : tableData.length > 0 ? (
        <DataTable
          columns={dispatcherColumns}
          data={tableData}
          renderRow={renderDispatcherRow}
          loading={loading}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-12 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl mb-3">👥</div>
              <div className="text-slate-600">
                {loading ? "Loading dispatchers..." : "No dispatchers found"}
              </div>
              <div className="text-slate-400 text-sm mt-1">
                {searchInput
                  ? "Try adjusting your search terms"
                  : "Get started by adding your first dispatcher"}
              </div>
              {!loading && (
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Retry Loading
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={popup}
        onClose={closeCreateUserPopup}
        onSubmit={handleCreateUser}
        isLoading={creatingUser}
      />

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={popupSetting}
        onClose={closeSettingsPopup}
        user={selectedUser}
        onUpdateRole={handleUpdateRole}
        onActivateUser={handleActivateUser}
        onDeactivateUser={handleDeactivateUser}
        isLoading={updatingRole || activating || deactivating}
      />

      {/* Pagination */}
      {pagination && dispatchers.length > 0 && (
        <Pagination
          pagination={pagination}
          page={page}
          setPage={setPage}
          pageSize={10}
          showInfo={true}
        />
      )}
    </section>
  );
};

export default Users;
