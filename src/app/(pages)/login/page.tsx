"use client";
import Loading from "@/components/ui/Loading";
import { loginSuccess } from "@/redux/slices/authSlice";
// Importing RTK
import { useAppDispatch } from "@/redux/store";
// Importing Next Components
import { useRouter } from "next/navigation";
// Importing React Hooks
import { useState } from "react";

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const apiURL = process.env.NEXT_PUBLIC_API_URL;

  // login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${apiURL}/api/v1/auth/logIn`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Invalid Credentials");

      dispatch(loginSuccess({
        user: result.data,
        token: result.token
      }));

      if (result.data.role === "admin") {
        router.push("/admin/loads");
      } else {
        router.push(`/dispatchers/loads`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message || "Loading Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // set loading
  if (loading) return <Loading />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-80"
      >
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>

        {err && <p className="text-red-600 text-sm mb-3 text-center">{err}</p>}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="block w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full bg-indigo-600 text-white py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
