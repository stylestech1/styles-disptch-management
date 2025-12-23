"use client";

import { useRef } from "react";
import { Avatar } from "./ui/Avatar";
import { useUsersInfinite } from "@/hook/chatSys/useUsersInfinite";
import { useCreateOrGetConversationMutation } from "@/redux/slices/apiSlice";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { setSelectedConversation } from "@/redux/slices/chatSlice";

export const UsersList = () => {
  const { users, loadMore, isFetching, hasMore } = useUsersInfinite(100);
  

  const [createOrGetConversation, { isLoading }] =
    useCreateOrGetConversationMutation();

  const dispatch = useAppDispatch();

  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !hasMore) return;

    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;

    if (isBottom) loadMore();
  };

  const handleUserClick = async (userId: string) => {
    try {
      const conversation = await createOrGetConversation({
        userId,
      }).unwrap();

      dispatch(setSelectedConversation(conversation.id));
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto"
    >
      {users
        .filter((user) => user.id !== currentUserId)
        .map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user.id)}
            className="flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 hover:bg-blue-100 transition-colors duration-200"
          >
            <Avatar name={user.name} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </div>
        ))}

      {(isFetching || isLoading) && (
        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
      )}

      {!hasMore && (
        <div className="p-4 text-center text-xs text-gray-400">
          No more users
        </div>
      )}
    </div>
  );
};
