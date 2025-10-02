"use client";
import Link from "next/link";
import { useTabs } from "@/hook/useTabs"; 
import { usePathname } from "next/navigation";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { useEffect } from "react";
import { loginSuccess } from "@/redux/slices/authSlice";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const tabs = useTabs();
  const pathname = usePathname();
  const dispatch = useAppDispatch()
  const user = useAppSelector((state: RootState) => state.auth.user )

  useEffect(() => {
    dispatch(loginSuccess({id: '1', name: 'Test Admin', role: 'admin'}))
  }, [dispatch])

  return (
    <section className="mx-auto flex">
      <div className="w-64 h-screen border-r bg-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b">{user?.name}</div>
        <nav className="flex-1 p-2 space-y-2">
          {tabs.map((tab, i) => {
            const link = `/admin/${tab.toLowerCase()}`;
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">{children}</div>
    </section>
  );
}
