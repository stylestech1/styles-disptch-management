"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  role: "admin" | "dispatcher";
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "admin"
      ? [
          { label: "Loads", href: "/admin/loads" },
          { label: "Drivers", href: "/admin/drivers" },
          { label: "Dispatchers", href: "/admin/dispatchers" },
          { label: "Truckers", href: "/admin/truckers" },
          { label: "Trailers", href: "/admin/trailers" },
        ]
      : [
          { label: "Loads", href: "/dispatchers/loads" },
        ];

  return (
    <aside className="w-70 h-screen border-r bg-white flex flex-col">
      <div className="p-4 font-bold text-lg border-b">
        {role === "admin" ? "Admin Dashboard" : "Dispatcher Dashboard"}
      </div>
      <nav className="flex-1 p-2 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md transition ${
                isActive
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
