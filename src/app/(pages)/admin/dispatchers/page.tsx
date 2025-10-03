"use client";
import Erros from "@/components/ui/Erros";
import Loading from "@/components/ui/Loading";
import Titles from "@/components/ui/Titles";
import { RootState, useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoClose, IoAdd, IoSearch, IoPerson, IoMail, IoCall, IoKey, IoBriefcase } from "react-icons/io5";
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
    <section className="relative p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <Titles>Dispatcher Management</Titles>
          <p className="text-slate-600 mt-2 text-sm">Manage your dispatch team members and their access</p>
        </div>
        
        <button
          onClick={() => setPopup(true)}
          className="flex items-center gap-2 py-3 px-6 cursor-pointer text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-lg shadow-sm font-medium"
        >
          <IoAdd size={20} />
          Add New User
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
            placeholder="Search by name or job ID..."
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
              <p className="text-slate-500 text-sm font-medium">Total Dispatchers</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{dispatchers.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <IoPerson size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {dispatchers.filter(d => d.active).length}
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <IoBriefcase size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Admins</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {dispatchers.filter(d => d.role === 'admin').length}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <IoKey size={20} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Employees</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {dispatchers.filter(d => d.role === 'employee').length}
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
                <th className="text-left p-4 font-medium text-slate-600">Name</th>
                <th className="text-left p-4 font-medium text-slate-600">Email</th>
                <th className="text-left p-4 font-medium text-slate-600">Phone</th>
                <th className="text-left p-4 font-medium text-slate-600">Role</th>
                <th className="text-left p-4 font-medium text-slate-600">Position</th>
                <th className="text-left p-4 font-medium text-slate-600">Job ID</th>
                <th className="text-center p-4 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDispatchers.length > 0 ? (
                filteredDispatchers.map((dispatcher, i) => (
                  <tr
                    key={dispatcher.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4 text-slate-600 font-medium">{i + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <IoPerson size={14} className="text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-900">{dispatcher.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{dispatcher.email}</td>
                    <td className="p-4 text-slate-700">{dispatcher.phone}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        dispatcher.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {dispatcher.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">{dispatcher.position}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                        {dispatcher.jobId}
                      </span>
                    </td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl mb-3">👥</div>
                      <div className="text-slate-600">No dispatchers found</div>
                      <div className="text-slate-400 text-sm mt-1">
                        {search ? 'Try adjusting your search terms' : 'Get started by adding your first dispatcher'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Form */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Add New User</h3>
              <button
                onClick={() => setPopup(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoPerson className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter email address"
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
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                    className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Position"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={newUser.passwordConfirmation}
                    onChange={(e) => setNewUser({ ...newUser, passwordConfirmation: e.target.value })}
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
          </div>
        </div>
      )}
    </section>
  );
};

export default Dispatchers;