"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoClose,
  IoAdd,
  IoSearch,
  IoPerson,
  IoMail,
  IoCall,
  IoKey,
  IoBriefcase,
  IoSettingsOutline,
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TDispatcher, TErrors, TPagination } from "@/types/globalTypes";
import useLoading from "@/hook/useLoading";
import useError from "@/hook/useError";
import { apiClient } from "@/utils/apiClient";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modals";
import DataTable from "@/components/ui/DataTable";
import { dispatcherColumns } from "@/data/dispatcherTables";
import StatsCard from "@/components/ui/StatsCard";

const Dispatchers = () => {
  const [dispatchers, setDispatchers] = useState<TDispatcher[]>([]);
  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState(false);
  const [popupSetting, setPopupSetting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TDispatcher | null>(null);
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [page, setPage] = useState(1);
  const [tempUser, setTempUser] = useState({
    role: "employee" as "admin" | "employee",
    status: "active" as "active" | "deactive",
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    position: "",
    password: "",
    passwordConfirmation: "",
  });

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const { loading, setLoading } = useLoading();
  const { error, setError } = useError();
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // FIXME: Get all Dispatchers
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    const fetchDispatchers = async () => {
      try {
        setLoading(true);
        const result = await apiClient(
          `${apiURL}/api/v1/adminDashboard?page=${page}`,
          token
        );
        setDispatchers((result.data as TDispatcher[]) || []);
        setPagination(result.paginationResult as TPagination);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || "Loading Failed");
          toast.error(error.message || "Loading Failed", {
            style: { background: "#dc2626", color: "#fff" },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDispatchers();
  }, [apiURL, token, router, setError, setLoading, page]);

  // TODO: Search Filter
  const filteredDispatchers = dispatchers.filter(
    (dispatcher) =>
      dispatcher.name.toLowerCase().includes(search.toLowerCase()) ||
      dispatcher.jobId.toString().includes(search)
  );

  // FIXME: Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const result = await apiClient(`${apiURL}/api/v1/adminDashboard`, token, {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      toast.success("User created successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });

      setDispatchers((prev) => [...prev, result.data] as TDispatcher[]);
      setPopup(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "employee",
        position: "",
        password: "",
        passwordConfirmation: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // FIXME: Update User Role
  const handleUpdateRole = async (
    userId: string,
    newRole: "admin" | "employee"
  ) => {
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const result = await apiClient(
        `${apiURL}/api/v1/adminDashboard/${userId}`,
        token,
        {
          method: "PUT",
          body: JSON.stringify({ role: newRole }),
        }
      );

      toast.success(
        result.message || `Role updated to ${newRole} successfully!`,
        {
          style: { background: "#16a34a", color: "#fff" },
        }
      );

      // Update the user in the state
      setDispatchers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // FIXME: Activate User
  const handleActivateUser = async (userId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const result = await apiClient(
        `${apiURL}/api/v1/adminDashboard/activate/${userId}`,
        token,
        {
          method: "PUT",
        }
      );

      toast.success(result.message || "User activated successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });

      // Update the user status in the state
      setDispatchers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, active: true } : user
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // FIXME: Deactivate User
  const handleDeactivateUser = async (userId: string) => {
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const result = await apiClient(
        `${apiURL}/api/v1/adminDashboard/deactivate/${userId}`,
        token,
        {
          method: "PUT",
        }
      );
      toast.success(result.message || "User deactivated successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });

      // Update the user status in the state
      setDispatchers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, active: false } : user
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  // TODO: Function to open settings popup
  const openSettingsPopup = (user: TDispatcher) => {
    setSelectedUser(user);
    setTempUser({
      role: user.role as "admin" | "employee",
      status: user.active ? "active" : "deactive",
    });
    setPopupSetting(true);
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

  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Dispatcher Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage your dispatch team members and their access
          </p>
        </div>

        <button
          onClick={() => setPopup(true)}
          className="flex items-center gap-2 py-3 px-6 cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-sm font-medium"
        >
          <IoAdd size={20} />
          Add New User
        </button>
      </div>

      <Toaster position="top-center" reverseOrder={false} />

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or job ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Erros message={error} />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Dispatchers"
          value={dispatchers.length || 0}
          icon={IoPerson}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Active"
          value={dispatchers.filter((d) => d.active).length}
          icon={IoBriefcase}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />

        <StatsCard
          title="Admins"
          value={dispatchers.filter((d) => d.role === "admin").length}
          icon={IoKey}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />

        <StatsCard
          title="Employees"
          value={dispatchers.filter((d) => d.role === "employee").length}
          icon={IoPerson}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Table */}
      {filteredDispatchers.length > 0 ? (
        <DataTable
          columns={dispatcherColumns}
          data={filteredDispatchers}
          renderRow={renderDispatcherRow}
          loading={loading}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-12 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl mb-3">👥</div>
              <div className="text-slate-600">No dispatchers found</div>
              <div className="text-slate-400 text-sm mt-1">
                {search
                  ? "Try adjusting your search terms"
                  : "Get started by adding your first dispatcher"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Form to add new user */}
      <Modal
        isOpen={popup}
        onClose={() => setPopup(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPerson className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCall className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Position
              </label>
              <input
                type="text"
                value={newUser.position}
                onChange={(e) =>
                  setNewUser({ ...newUser, position: e.target.value })
                }
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Position"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoKey className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoKey className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={newUser.passwordConfirmation}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    passwordConfirmation: e.target.value,
                  })
                }
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Confirm password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
          >
            <IoAdd size={18} />
            Create User
          </button>
        </form>
      </Modal>

      {/* Popup Form to update user role and status */}
      {popupSetting && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-1">
                <IoSettingsOutline size={20} />
                <span>User Settings</span>
              </h3>
              <button
                onClick={() => {
                  setPopupSetting(false);
                  setSelectedUser(null);
                }}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-800">
                {selectedUser.name}
              </h4>
              <p className="text-sm text-slate-600">{selectedUser.email}</p>
              <p className="text-sm text-slate-600">{selectedUser.phone}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle both role change and status update
                if (selectedUser) {
                  // Update role if changed
                  if (selectedUser.role !== tempUser.role) {
                    handleUpdateRole(selectedUser.id, tempUser.role);
                  }

                  // Update status if changed
                  if (selectedUser.active !== (tempUser.status === "active")) {
                    if (tempUser.status === "active") {
                      handleActivateUser(selectedUser.id);
                    } else {
                      handleDeactivateUser(selectedUser.id);
                    }
                  }

                  setPopupSetting(false);
                  setSelectedUser(null);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <select
                    value={tempUser.role}
                    onChange={(e) =>
                      setTempUser({
                        ...tempUser,
                        role: e.target.value as "admin" | "employee",
                      })
                    }
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={tempUser.status}
                    onChange={(e) =>
                      setTempUser({
                        ...tempUser,
                        status: e.target.value as "active" | "deactive",
                      })
                    }
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="deactive">Deactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
              >
                <IoSettingsOutline size={18} />
                <span>Update User</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        page={page}
        setPage={setPage}
        pageSize={10}
        showInfo={true}
      />
    </section>
  );
};

export default Dispatchers;
