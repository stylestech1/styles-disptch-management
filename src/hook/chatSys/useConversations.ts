"use client";
import { useGetUserConversationsQuery } from "@/redux/slices/apiSlice";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { upsertConversation } from "@/redux/slices/chatSlice";
import { useEffect } from "react";

export const useConversations = () => {
  const dispatch = useAppDispatch();

  const {
    data: conversationsData = [],
    isLoading,
    isError,
    refetch,
  } = useGetUserConversationsQuery();

  const conversationsFromStore = useAppSelector(
    (state) => state.chat.conversations
  );

  useEffect(() => {
    if (conversationsData.length > 0) {
      conversationsData.forEach((conv) => {
        dispatch(upsertConversation(conv));
      });
    }
  }, [conversationsData, dispatch]);

  const conversations =
    Object.values(conversationsFromStore).length > 0
      ? Object.values(conversationsFromStore)
      : conversationsData;

  return {
    conversations,
    isLoading,
    isError,
    refetch,
  };
};
