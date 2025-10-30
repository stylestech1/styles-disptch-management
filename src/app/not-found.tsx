"use client";

import { useRouter } from "next/navigation";
import { IoHomeOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { RootState, useAppSelector } from "@/redux/store";

export default function NotFound() {
  const router = useRouter();
  const role = useAppSelector((state: RootState) => state.auth.user?.role);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-8xl font-bold text-blue-600 mb-4"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3"
      >
        Page Not Found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 dark:text-gray-400 max-w-md mb-8"
      >
        The page you’re looking for doesn’t exist or you don’t have access to
        it.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          if (role === "admin") {
            router.push("/admin");
          } else if (role === "employee") {
            router.push("/dispatchers");
          } else {
            router.push("/");
          }
        }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition-all"
      >
        <IoHomeOutline size={20} />
        Back to Home
      </motion.button>
    </div>
  );
}
