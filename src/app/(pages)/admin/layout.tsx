"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { TABS_CONFIG } from "@/constants/tabs";
import { logout } from "@/redux/slices/authSlice";
import {
  IoLogOutOutline,
  IoPersonCircleOutline,
  IoChevronForward,
  IoMenu,
  IoClose,
} from "react-icons/io5";
import { useState, useEffect } from "react";
import { useGoogleMaps } from "@/hook/useGoogleMaps";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Google Hook
  const isGoogleMapsLoaded = useGoogleMaps();

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!user) return null;

  const tabs = TABS_CONFIG[user.role];
  const base = user.role === "admin" ? "/admin" : "/dispatchers";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <section className="flex h-screen">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative z-50 w-80 h-full bg-gradient-to-b from-slate-800 to-slate-700 text-white
        transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
        flex flex-col shadow-xl border-r border-slate-600
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-600">
          <div className="flex justify-between items-center">
            <Link href={user.id} className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-xl">
                <IoPersonCircleOutline size={24} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate text-slate-100">
                  {user?.name}
                </h2>
                <p className="text-slate-400 text-sm capitalize">{user.role}</p>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab, i) => {
            const link = `${base}/${tab.toLowerCase()}`;
            const active = pathname.startsWith(link);
            return (
              <Link
                key={i}
                href={link}
                onClick={() => isMobile && setIsSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-emerald-500 text-white shadow-lg transform scale-[1.02]"
                      : "text-slate-300 hover:bg-slate-600 hover:text-white hover:shadow-md"
                  }
                  group
                `}
              >
                <span className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      active
                        ? "bg-white"
                        : "bg-slate-400 group-hover:bg-emerald-200"
                    }`}
                  />
                  {tab}
                </span>
                <IoChevronForward
                  size={16}
                  className={`transform transition-transform ${
                    active
                      ? "rotate-90 text-white"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-600">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium
                     bg-slate-600 hover:bg-slate-500 text-slate-200 transition-all duration-200
                     hover:shadow-md hover:text-white"
          >
            <IoLogOutOutline size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="md:hidden bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 
                       transition-colors shadow-sm text-slate-600"
            >
              <IoMenu size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {isGoogleMapsLoaded ? (
              children
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Loading Google Maps...</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Please wait while we load the maps
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
