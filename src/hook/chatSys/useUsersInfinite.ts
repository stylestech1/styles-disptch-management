import { useEffect, useState } from "react";
import { useGetActiveUsersQuery } from "@/redux/slices/apiSlice";
import { TUser } from "@/types/globalTypes";

export const useUsersInfinite = (limit = 10) => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<TUser[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isFetching, isLoading } = useGetActiveUsersQuery({
    page,
    limit: 100,
  });

  useEffect(() => {
    if (!data?.data) return;

    setUsers((prev) => {
      const newUsers = data.data.filter(
        (u: TUser) => !prev.some((p) => p.id === u.id)
      );
      return [...prev, ...newUsers];
    });

    if (data.data.length < limit) {
      setHasMore(false);
    }
  }, [data, limit]);

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return {
    users,
    isLoading,
    isFetching,
    hasMore,
    loadMore,
  };
};
