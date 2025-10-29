"use client";
import { useState, useEffect } from "react";
import { IoClose, IoSettingsOutline } from "react-icons/io5";
import { TDispatcher } from "@/types/globalTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import toast from "react-hot-toast";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TDispatcher | null;
  onUpdateRole: (
    userId: string,
    newRole: "admin" | "employee"
  ) => Promise<void>;
  onActivateUser: (userId: string) => Promise<void>;
  onDeactivateUser: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

const UserSettingsModal = ({
  isOpen,
  onClose,
  user,
  onUpdateRole,
  onActivateUser,
  onDeactivateUser,
  isLoading = false,
}: UserSettingsModalProps) => {
  const [tempUser, setTempUser] = useState({
    role: "employee" as "admin" | "employee",
    status: "active" as "active" | "deactive",
  });

  useEffect(() => {
    if (user) {
      setTempUser({
        role: user.role as "admin" | "employee",
        status: user.active ? "active" : "deactive",
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (user.role !== tempUser.role) {
        await onUpdateRole(user.id, tempUser.role);
      }

      if (user.active !== (tempUser.status === "active")) {
        if (tempUser.status === "active") {
          await onActivateUser(user.id);
        } else {
          await onDeactivateUser(user.id);
        }
      }

      onClose();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Adding note failed ❌");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-1">
            <IoSettingsOutline size={20} />
            <span>User Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-800">{user.name}</h4>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-sm text-slate-600">{user.phone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
          >
            <IoSettingsOutline size={18} />
            {isLoading ? "Updating..." : "Update User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSettingsModal;
