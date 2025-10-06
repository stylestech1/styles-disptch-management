"use client";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { TUserRole } from "@/types/globalTypes";
import { useState, useEffect } from "react";
import Erros from "@/components/ui/Erros";
import toast from "react-hot-toast";
import {
  IoPersonCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoIdCardOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoRefresh,
  IoClose,
  IoPersonOutline,
} from "react-icons/io5";

type TUser = {
  id: string;
  name: string;
  active: boolean;
  email: string;
  phone: string;
  role: TUserRole;
  position: string;
  jobId: number;
};

const AdminProfile = () => {
  const [profile, setProfile] = useState<TUser | null>(null);
  const [popup, setPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get My Data
  useEffect(() => {
    const fetchMyData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiURL}/api/v1/userDashboard/getMyData`, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        setProfile(result.data);
        // Initialize form data with current profile data
        setFormData({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
        });
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, [apiURL, token]);

  // Update My Data Function
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      const res = await fetch(`${apiURL}/api/v1/userDashboard/updateMyData`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update Failed");
      
      toast.success(result.message || "Profile updated successfully! ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });
      
      setProfile(result.data);
      setPopup(false);
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message || "Update failed");
        toast.error(error.message || "Update failed ❌", {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open popup and set form data
  const openUpdatePopup = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
    }
    setPopup(true);
  };

  if (loading) return <Loading />;

  return (
    <section className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Titles>User Profile</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            You can Update or View your information
          </p>
        </div>
        <button
          onClick={openUpdatePopup}
          className="flex items-center gap-2 py-3 px-5 cursor-pointer text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow-sm font-medium"
        >
          <IoRefresh size={18} />
          Update Profile
        </button>
      </div>

      {/* Errors */}
      {err && (
        <div className="mb-6">
          <Erros message={err} />
        </div>
      )}

      {/* Profile and Summary Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Driver Profile Card */}
        {profile && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-slate-100 rounded-xl">
                <IoPersonCircleOutline size={28} className="text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {profile.name}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">ID: {profile.jobId}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-sm">
                <IoMailOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600 truncate">{profile.email}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoCallOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600">{profile.phone}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoIdCardOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600 capitalize">
                  {profile.role}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoCalendarOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span className="text-slate-600">{profile.position}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <IoCheckmarkCircleOutline
                  className="text-slate-400 flex-shrink-0"
                  size={16}
                />
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    profile.active 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                      : "bg-slate-100 text-slate-800 border border-slate-200"
                  }`}
                >
                  {profile.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Profile Popup */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Update Profile
              </h3>
              <button
                onClick={() => setPopup(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                disabled={updateLoading}
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoPersonOutline className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter full name"
                    required
                    disabled={updateLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMailOutline className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter email address"
                    required
                    disabled={updateLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCallOutline className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter phone number"
                    required
                    disabled={updateLoading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPopup(false)}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <IoRefresh size={18} />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Read-only fields info */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 mb-2">
                Note:
              </h4>
              <p className="text-xs text-slate-600">
                Role, Position, and Status cannot be changed from this form. 
                Please contact administrator for these changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminProfile;