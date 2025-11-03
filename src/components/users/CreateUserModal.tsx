"use client";
import { useState } from "react";
import {
  IoAdd,
  IoPerson,
  IoMail,
  IoCall,
  IoKey,
  IoClose,
} from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    position: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  password: string;
  passwordConfirmation: string;
}

const CreateUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateUserModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<UserFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      position: "",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onSubmit",
  });

  const watchPassword = watch("password");

  const onSubmitForm = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      reset();
      setShowPassword(false);
      setShowPasswordConfirm(false);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "Adding user Failed ❌");
    }
  };

  const handleClose = () => {
    reset();
    setShowPassword(false);
    setShowPasswordConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-1">
            <IoAdd size={20} />
            <span>Add New User</span>
          </h3>
          <button
            onClick={handleClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <TextField
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Name must be less least 50 characters",
                  },
                })}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Enter full name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IoPerson className="h-5 w-5 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <TextField
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.email ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Enter full name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IoMail className="h-5 w-5 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <TextField
                type="text"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: "Invalid phone number format",
                  },
                  minLength: {
                    value: 8,
                    message: "Phone number must be at least 8 digits",
                  },
                })}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.phone ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Enter phone number"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IoCall className="h-5 w-5 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <FormControl fullWidth error={!!errors.role}>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select
                      labelId="demo-simple-select-label"
                      displayEmpty
                      {...field}
                      value={field.value || ""}
                      className={`block w-full border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.role ? "border-red-500" : "border-slate-300"
                      }`}
                    >
                      <MenuItem value="" disabled>
                        <span className="text-slate-400">Select a role...</span>
                      </MenuItem>
                      <MenuItem value={"employee"}>Employee</MenuItem>
                      <MenuItem value={"admin"}>Admin</MenuItem>
                      <MenuItem value={"driver"}>Driver</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Position
              </label>
              <TextField
                type="text"
                {...register("position", {
                  required: "Position is required",
                  minLength: {
                    value: 2,
                    message: "Position must be at least 2 characters",
                  },
                })}
                className={`block w-full border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.position ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Position"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.position.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <TextField
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                  },
                })}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.password ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="Enter password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IoKey className="h-5 w-5 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <TextField
                type={showPasswordConfirm ? "text" : "password"}
                {...register("passwordConfirmation", {
                  required: "Please confirm your password",
                  validate: (value: string) =>
                    value === watchPassword || "Passwords do not match",
                })}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                  errors.passwordConfirmation
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
                placeholder="Confirm password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IoKey className="h-5 w-5 text-slate-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswordConfirm ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
              {errors.passwordConfirmation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordConfirmation.message}
                </p>
              )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
          >
            <IoAdd size={18} />
            {isLoading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
