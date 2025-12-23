'use client'
import { useAppSelector } from "@/redux/store";
import { socketService } from "@/services/socketService";

export const UserStatus = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isConnected = useAppSelector((state) =>
    socketService.getConnectionStatus()
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.[0] || "U"}
          </div>
          <div
            className={`
            absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
            ${isConnected ? "bg-green-500" : "bg-gray-400"}
          `}
          />
        </div>
        <div>
          <div className="font-medium text-gray-900">{user?.name}</div>
          <div className="text-xs text-gray-500">
            {isConnected ? "online" : "offline"}
          </div>
        </div>
      </div>
    </div>
  );
};
