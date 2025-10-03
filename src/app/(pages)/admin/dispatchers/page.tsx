"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

type TDispatcher = {
  id: string;
  name: string;
  active: boolean;
  email: string;
  phone: string;
  role: string;
  position: string;
  jobId: number;
};

const Dispatchers = () => {
  const [dispatchers, setDispatchers] = useState<TDispatcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState(false);

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
  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // Get all Dispatchers
  useEffect(() => {
    if (!token) {
      router.replace("/");
      return;
    }

    const fetchDispatchers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiURL}/api/v1/adminDashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setDispatchers(result.data || []);
      } catch (error) {
        if (error instanceof Error) {
          setErr(error.message || "Loading Failed");
          toast.error(error.message || "Loading Failed");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDispatchers();
  }, [apiURL, token, router]);

  // Search Filter
  const filteredDispatchers = dispatchers.filter(
    (dispatcher) =>
      dispatcher.name.toLowerCase().includes(search.toLowerCase()) ||
      dispatcher.jobId.toString().includes(search)
  );

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiURL}/api/v1/adminDashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Create user failed");
        return;
      }

      toast.success("User created successfully!", {
        style: { background: "#16a34a", color: "#fff" },
      });

      setDispatchers((prev) => [...prev, result.data]);
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

  if (loading) return <Loading />;

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <Titles>All Dispatchers</Titles>
        <button
          onClick={() => setPopup(true)}
          className="py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
        >
          Create New User
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name or Id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-400 p-2 rounded w-1/3"
        />
      </div>

      {err && <Erros message={err} />}

      {/* Table */}
      <div className="overflow-x-auto my-10">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-md text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Position</th>
              <th className="p-3 text-left">Job ID</th>
              <th className="p-3 text-center">Active</th>
            </tr>
          </thead>
          <tbody>
            {filteredDispatchers.length > 0 ? (
              filteredDispatchers.map((dispatcher, i) => (
                <tr
                  key={dispatcher.id}
                  className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50"
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{dispatcher.name}</td>
                  <td className="p-3">{dispatcher.email}</td>
                  <td className="p-3">{dispatcher.phone}</td>
                  <td className="p-3">{dispatcher.role}</td>
                  <td className="p-3">{dispatcher.position}</td>
                  <td className="p-3">{dispatcher.jobId}</td>
                  <td className="p-3 text-center">
                    {dispatcher.active ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No Dispatcher records found
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
              onSubmit={handleCreateUser}
              className="mt-3 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Phone</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Position</label>
                <input
                  type="text"
                  value={newUser.position}
                  onChange={(e) =>
                    setNewUser({ ...newUser, position: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  required
                />
              </div>

              {/* Password Confirmation */}
              <div className="flex flex-col gap-2">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={newUser.passwordConfirmation}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      passwordConfirmation: e.target.value,
                    })
                  }
                  className="border border-gray-500 p-2 rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-5 cursor-pointer text-white bg-green-700 hover:bg-green-800 transition-colors rounded-lg"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dispatchers;
