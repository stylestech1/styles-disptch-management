"use client";
import { useState, useEffect } from "react";
import { IoClose, IoSettingsOutline } from "react-icons/io5";
import { TDispatcher, TUserRole } from "@/types/globalTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { RootState, useAppSelector } from "@/redux/store";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: TDispatcher | null;
  onUpdateRole: (
    userId: string,
    newRole: TUserRole
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
    role: "employee" as TUserRole,
    status: "active" as "active" | "deactive",
  });

  const theme = useAppSelector((state: RootState) => state.palette);

  useEffect(() => {
    if (user) {
      setTempUser({
        role: user.role as TUserRole,
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
      <Box
        sx={{ bgcolor: theme.currentPalette.background }}
        className="relative rounded-2xl shadow-2xl border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-1">
            <IoSettingsOutline size={20} />
            <Typography
              sx={{
                color: theme.currentPalette.primary,
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              User Settings
            </Typography>
          </h3>
          <Button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <IoClose size={24} />
          </Button>
        </div>

        {/* User Info */}
        <Box
          sx={{ border: 1, borderColor: theme.currentPalette.text }}
          className="mb-6 p-4 rounded-lg"
        >
          <h4 className="font-medium text-slate-800">{user.name}</h4>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-sm text-slate-600">{user.phone}</p>
        </Box>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <FormControl fullWidth>
                <Select
                  value={tempUser.role}
                  onChange={(e) =>
                    setTempUser({
                      ...tempUser,
                      role: e.target.value as TUserRole,
                    })
                  }
                  sx={{ bgcolor: theme.currentPalette.background }}
                  className="block w-full border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <MenuItem value={"employee"}>Employee</MenuItem>
                  <MenuItem value={"admin"}>Admin</MenuItem>
                  <MenuItem value={"driver"}>Driver</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <FormControl fullWidth>
                <Select
                  value={tempUser.status}
                  onChange={(e) =>
                    setTempUser({
                      ...tempUser,
                      status: e.target.value as "active" | "deactive",
                    })
                  }
                  sx={{ bgcolor: theme.currentPalette.background }}
                  className="block w-full border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <MenuItem value={"active"}>Active</MenuItem>
                  <MenuItem value={"deactive"}>Deactive</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            sx={{ bgcolor: theme.currentPalette.primary, color: theme.currentPalette.background }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
          >
            <IoSettingsOutline size={18} />
            {isLoading ? "Updating..." : "Update User"}
          </Button>
        </form>
      </Box>
    </div>
  );
};

export default UserSettingsModal;
