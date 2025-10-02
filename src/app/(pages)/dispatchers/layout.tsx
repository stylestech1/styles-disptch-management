"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { TABS_CONFIG } from "@/constants/tabs";
import { logout } from "@/redux/slices/authSlice";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!user) return null;
  const tabs = TABS_CONFIG[user.role];
  const base = user.role === "admin" ? "/admin" : "/dispatchers";

  return (
    <section className="mx-auto flex">
      <div className="relative w-64 h-screen border-r bg-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b">{user?.name}</div>
        <nav className="flex-1 p-2 space-y-2">
          {tabs.map((tab, i) => {
            const link = `${base}/${tab.toLowerCase()}`;
            const active = pathname.startsWith(link);
            return (
              <Link
                key={i}
                href={link}
                className={`block px-4 py-2 rounded font-bold transition 
                  ${active ? "bg-blue-700 text-white" : "hover:bg-blue-100"}
                `}
              >
                {tab}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            dispatch(logout());
            router.replace("/");
          }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-lg w-50 text-white bg-red-700 hover:bg-red-800 transition-colors py-2 px-5 cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">{children}</div>
    </section>
  );
}
