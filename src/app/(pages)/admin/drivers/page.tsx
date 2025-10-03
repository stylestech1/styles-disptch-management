"use client";
import React from "react";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import { TDriver } from "@/types/globalTypes";
import Link from "next/link";

const DriversPage = () => {
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");

  const [newDriver, setNewDriver] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
  });

  const [popup, setPopup] = useState(false);

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get all Drivers
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/api/v1/drivers`, {
          method: "GET",
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
          setErr(error.message || "Loading Failed");
          toast.error(error.message || "Failed to load drivers", {
            style: { background: "#dc2626", color: "#fff" },
          });
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

  // Create Driver
  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiURL}/api/v1/drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDriver),
      });

      const result = await res.json();
      if (!res.ok) {
        if (result.errors?.length) throw new Error(result.errors[0].msg);
        throw new Error(result.message || "Create driver failed");
      }

      setDrivers((prev) => [...prev, result.data || result.driver]);
      setPopup(false);
      setNewDriver({ name: "", email: "", phone: "", licenseNumber: "" });

      toast.success("Driver created successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          style: { background: "#dc2626", color: "#fff" },
        });
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="relative">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-4">
        <Titles>All Drivers</Titles>

        <button
          onClick={() => setPopup(true)}
          className="py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
        >
          Create New Driver
        </button>
      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-400 p-2 rounded w-1/3"
        />
      </div>

      {err && <Erros message={err} />}

      <div className="overflow-x-auto my-5">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-md text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Driver Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">License Number</th>
              <th className="p-3 text-center">Summary</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((driver, i) => (
                <tr
                  key={driver.driverId}
                  className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50"
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{driver.name || "-"}</td>
                  <td className="p-3">{driver.email || "-"}</td>
                  <td className="p-3">{driver.phone || "-"}</td>
                  <td className="p-3">{driver.licenseNumber || "-"}</td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/driverSummary/${driver.id}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full shadow-sm transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No Driver records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="relative rounded-lg shadow-xl border border-gray-300 bg-white p-5 max-w-md w-full">
            <button
              onClick={() => setPopup(false)}
              className="cursor-pointer text-red-600 absolute top-2 right-2"
            >
              <IoClose size={25} />
            </button>

            <form
              onSubmit={handleCreateDriver}
              className="mt-3 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label>Driver Name</label>
                <input
                  type="text"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Email</label>
                <input
                  type="email"
                  value={newDriver.email}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, email: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="driver@email.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Phone</label>
                <input
                  type="text"
                  value={newDriver.phone}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, phone: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="+201234567890"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>License Number</label>
                <input
                  type="text"
                  value={newDriver.licenseNumber}
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      licenseNumber: e.target.value,
                    })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="ABC12345"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
              >
                Create Driver
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default DriversPage;
