"use client";
import React, { useEffect, useState } from "react";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import {
  IoClose,
  IoAdd,
  IoSearch,
  IoStatsChart,
  IoPencil,
  IoTrash,
  IoPerson,
  IoCall,
  IoMail,
  IoCard,
  IoCash,
} from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TDriver } from "@/types/globalTypes";
import Link from "next/link";

const DriversPage = () => {
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<TDriver | null>(null);

  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    pricePerMile: "",
    status: "available",
  });

  const [updateDriver, setUpdateDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    pricePerMile: "",
    status: "available",
  });

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch drivers
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/api/v1/drivers`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        setDrivers(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message);
          toast.error(error.message || "Failed to load drivers");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [apiURL, token, router]);

  const filteredDrivers = drivers.filter((driver) =>
    driver.name.toLowerCase().includes(search.toLowerCase())
  );

  // Create driver
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiURL}/api/v1/drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newDriver,
          pricePerMile: parseFloat(newDriver.pricePerMile),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setDrivers((prev) => [...prev, result.data]);
      toast.success("Driver created successfully!");
      setPopup(false);
      setNewDriver({
        name: "",
        phone: "",
        email: "",
        licenseNumber: "",
        pricePerMile: "",
        status: "available",
      });
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  // Update driver
  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    try {
      const res = await fetch(`${apiURL}/api/v1/drivers/${selectedDriver.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...updateDriver,
          pricePerMile: parseFloat(updateDriver.pricePerMile),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setDrivers((prev) =>
        prev.map((d) => (d.id === selectedDriver.id ? result.data : d))
      );
      toast.success("Driver updated successfully!");
      setEditPopup(false);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  // Delete driver
  const handleDeleteDriver = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this driver?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${apiURL}/api/v1/drivers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to delete driver");
      }

      setDrivers((prev) => prev.filter((d) => d.id !== id));
      toast.success("Driver deleted successfully!");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      available: { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <IoPerson size={14} className="mr-1" /> },
      busy: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <IoPerson size={14} className="mr-1" /> },
      inactive: { color: "bg-slate-100 text-slate-800 border-slate-300", icon: <IoPerson size={14} className="mr-1" /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <section className="relative p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Driver Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">
            Manage your drivers and their information
          </p>
        </div>
        
        <button
          onClick={() => setPopup(true)}
          className="flex items-center gap-2 py-3 px-6 cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-sm font-medium"
        >
          <IoAdd size={20} />
          Add New Driver
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search drivers by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {err && <div className="mb-6"><Erros message={err} /></div>}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Drivers</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{drivers.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <IoPerson size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Available</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {drivers.filter(d => d.status === 'available').length}
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <IoPerson size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Busy</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {drivers.filter(d => d.status === 'busy').length}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <IoPerson size={20} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Inactive</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {drivers.filter(d => d.status === 'inactive').length}
              </p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <IoPerson size={20} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">#</th>
                <th className="text-left p-4 font-medium text-slate-600">Driver Details</th>
                <th className="text-left p-4 font-medium text-slate-600">Contact Information</th>
                <th className="text-left p-4 font-medium text-slate-600">License & Pricing</th>
                <th className="text-left p-4 font-medium text-slate-600">Status</th>
                <th className="text-left p-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver, i) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4 text-slate-600 font-medium">{i + 1}</td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <IoPerson size={18} className="text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{driver.name}</div>
                          <div className="text-xs text-slate-500 mt-1">ID: {driver.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-2">
                        {driver.phone && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <IoCall size={14} className="text-slate-400" />
                            <span className="text-sm">{driver.phone}</span>
                          </div>
                        )}
                        {driver.email && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <IoMail size={14} className="text-slate-400" />
                            <span className="text-sm">{driver.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-2">
                        {driver.licenseNumber && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <IoCard size={14} className="text-slate-400" />
                            <span className="text-sm">{driver.licenseNumber}</span>
                          </div>
                        )}
                        {driver.pricePerMile && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <IoCash size={14} className="text-slate-400" />
                            <span className="text-sm">${driver.pricePerMile.toFixed(2)}/mile</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <StatusBadge status={driver.status} />
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/driverSummary/${driver.id}`}
                          className="flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                          <IoStatsChart size={14} />
                          Stats
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedDriver(driver);
                            setUpdateDriver({
                              name: driver.name,
                              phone: driver.phone || "",
                              email: driver.email || "",
                              licenseNumber: driver.licenseNumber || "",
                              pricePerMile: driver.pricePerMile?.toString() || "",
                              status: driver.status || "available",
                            });
                            setEditPopup(true);
                          }}
                          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                          <IoPencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                          <IoTrash size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl mb-3">👨‍💼</div>
                      <div className="text-slate-600">No drivers found</div>
                      <div className="text-slate-400 text-sm mt-1">
                        {search ? 'Try adjusting your search terms' : 'Get started by adding your first driver'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Popup */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Add New Driver</h3>
              <button
                onClick={() => setPopup(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoPerson className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={newDriver.name}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, name: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newDriver.email}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, email: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCall className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={newDriver.phone}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, phone: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="License Number"
                    value={newDriver.licenseNumber}
                    onChange={(e) =>
                      setNewDriver({
                        ...newDriver,
                        licenseNumber: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price per Mile (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newDriver.pricePerMile}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, pricePerMile: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={newDriver.status}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, status: e.target.value })
                  }
                  className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 mt-4"
              >
                <IoAdd size={18} />
                Create Driver
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Popup */}
      {editPopup && selectedDriver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Edit Driver</h3>
              <button
                onClick={() => setEditPopup(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateDriver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoPerson className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={updateDriver.name}
                    onChange={(e) =>
                      setUpdateDriver({ ...updateDriver, name: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={updateDriver.email}
                    onChange={(e) =>
                      setUpdateDriver({ ...updateDriver, email: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCall className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={updateDriver.phone}
                    onChange={(e) =>
                      setUpdateDriver({ ...updateDriver, phone: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="License Number"
                    value={updateDriver.licenseNumber}
                    onChange={(e) =>
                      setUpdateDriver({
                        ...updateDriver,
                        licenseNumber: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price per Mile (USD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoCash className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={updateDriver.pricePerMile}
                    onChange={(e) =>
                      setUpdateDriver({
                        ...updateDriver,
                        pricePerMile: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={updateDriver.status}
                  onChange={(e) =>
                    setUpdateDriver({ ...updateDriver, status: e.target.value })
                  }
                  className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 mt-4"
              >
                <IoPencil size={18} />
                Update Driver
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default DriversPage;