"use client";
import Loading from "@/components/ui/Loading";
import { loginSuccess } from "@/redux/slices/authSlice";
import { useAppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  IoMailOutline,
  IoLockClosedOutline,
  IoLogInOutline,
} from "react-icons/io5";

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      if (!res.ok) {
        toast.error(result.message || "Create user failed", {
          style: { background: "#dc2626", color: "#fff" },
        });
        return;
      }

      dispatch(
        loginSuccess({
          user: result.data,
          token: result.token,
        })
      );

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Login Form */}
          <div className="p-8 lg:p-12">
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Styles Dispatch
                </h1>
              </div>
              <p className="text-slate-600 text-sm">
                Professional Load Management System
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Welcome Back
                </h2>
                <p className="text-slate-500 text-sm">
                  Sign in to your account
                </p>
              </div>

              {err && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center">{err}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoMailOutline className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IoLockClosedOutline className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <IoLogInOutline className="w-5 h-5" />
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Secure login for authorized personnel only
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Image and Description */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  Efficient Dispatch Management
                </h3>
                <p className="text-emerald-100 text-lg mb-6 leading-relaxed">
                  Streamline your logistics operations with our professional
                  dispatch services platform. Manage loads, track shipments, and
                  optimize your workflow.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-emerald-50">
                      Real-time load tracking
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-emerald-50">
                      Driver performance analytics
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-emerald-50">Automated reporting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="20" cy="20" r="2" fill="white" />
                <circle cx="50" cy="30" r="1.5" fill="white" />
                <circle cx="80" cy="20" r="2" fill="white" />
                <circle cx="30" cy="70" r="1.5" fill="white" />
                <circle cx="70" cy="80" r="2" fill="white" />
                <circle cx="90" cy="60" r="1.5" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
