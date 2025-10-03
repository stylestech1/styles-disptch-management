"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

type TTruck = {
  id: string;
  truckId: number;
  plateNumber: string;
  model: string;
  year: number;
  capacity: number;
  status: string;
  assignedDriver?: {
    name: string;
    driverId: number;
  };
  createdBy?: string;
  updatedBy?: string;
};

const TrucksPage = () => {
  const [trucks, setTrucks] = useState<TTruck[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [popup, setPopup] = useState(false);
  const [search, setSearch] = useState("");

  const [newTruck, setNewTruck] = useState({
    plateNumber: "",
    model: "",
    year: "",
    capacity: "",
    status: "available", 
  });

  const router = useRouter();
  const token = useAppSelector((state: RootState) => state.auth.token);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get all Trucks
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login");
      router.replace("/");
      return;
    }

    const fetchTrucks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/api/v1/trucks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setTrucks(result.data?.data || []);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          toast.error(error.message || "Loading Failed");

        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [apiURL, token, router]);

  // Search Filter
  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.model.toLowerCase().includes(search.toLowerCase()) ||
      truck.plateNumber.toLowerCase().includes(search.toLowerCase())
  );

  // Create Truck
  const handleCreateTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiURL}/api/v1/trucks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plateNumber: newTruck.plateNumber,
          model: newTruck.model,
          year: Number(newTruck.year),
          capacity: Number(newTruck.capacity),
          status: newTruck.status.toLowerCase(), 
        }),
      });

      const result = await res.json();
      console.log("create truck result:", result);

      if (!res.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((err: any) => {
            toast.error(err.msg || "Validation error");
          });
        } else {
          toast.error(result.message || "Create truck failed");
        }
        return;
      }


      toast.success("Truck created successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });      setTrucks((prev) => [...prev, result.data]);
      setPopup(false);
      setNewTruck({
        plateNumber: "",
        model: "",
        year: "",
        capacity: "",
        status: "available",
      });
    } catch (error) {
      if (error instanceof Error) {
   toast.error(error.message, {
          style: { background: "#dc2626", color: "#fff" },
        });      }
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <Titles>All Trucks</Titles>

        <button
          onClick={() => setPopup(true)}
          className="py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
        >
          Create New Truck
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by model or plate number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-400 p-2 rounded w-1/3"
        />
      </div>

      {err && <Erros message={err} />}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 my-10 text-center">
          <thead>
            <tr className="text-sm">
              <th className="border border-gray-500 p-2">#</th>
              <th className="bg-gray-100 border border-gray-500 p-2">
                Truck ID
              </th>
              <th className="border border-gray-500 p-2">Plate Number</th>
              <th className="bg-gray-100 border border-gray-500 p-2">Model</th>
              <th className="border border-gray-500 p-2">Year</th>
              <th className="bg-gray-100 border border-gray-500 p-2">
                Capacity
              </th>
              <th className="border border-gray-500 p-2">Status</th>
              <th className="bg-gray-100 border border-gray-500 p-2">Driver</th>
              <th className="border border-gray-500 p-2">Created By</th>
              <th className="bg-gray-100 border border-gray-500 p-2">
                Updated By
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck, i) => (
                <tr key={truck.id}>
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">{truck.truckId}</td>
                  <td className="border p-2">{truck.plateNumber}</td>
                  <td className="border p-2">{truck.model}</td>
                  <td className="border p-2">{truck.year}</td>
                  <td className="border p-2">{truck.capacity}</td>
                  <td className="border p-2">{truck.status}</td>
                  <td className="border p-2">
                    {truck.assignedDriver?.name || "-"}
                  </td>
                  <td className="border p-2">{truck.createdBy || "-"}</td>
                  <td className="border p-2">{truck.updatedBy || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No Truck records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Form */}
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
              onSubmit={handleCreateTruck}
              className="mt-3 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label>Plate Number</label>
                <input
                  type="text"
                  value={newTruck.plateNumber}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, plateNumber: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="ABC-1234"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Model</label>
                <input
                  type="text"
                  value={newTruck.model}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, model: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="Volvo FH16"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Year</label>
                <input
                  type="number"
                  value={newTruck.year}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, year: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="2010"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Capacity</label>
                <input
                  type="number"
                  value={newTruck.capacity}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, capacity: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  placeholder="25000"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Status</label>
                <select
                  value={newTruck.status}
                  onChange={(e) =>
                    setNewTruck({ ...newTruck, status: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
              >
                Create Truck
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TrucksPage;
