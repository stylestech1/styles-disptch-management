"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RootState, useAppSelector } from "@/redux/store";
import { TABS_CONFIG } from "@/constants/tabs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAppSelector((state: RootState) => state.auth.user);
  

  if (!user) return null;
  const tabs = TABS_CONFIG[user.role];
  const base = user.role === "admin" ? "/admin" : "/dispatchers";

  return (
    <section className="mx-auto flex">
      <div className="w-64 h-screen border-r bg-white flex flex-col">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">{children}</div>
    </section>
  );
}
