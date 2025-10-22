import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TDriver, TLoadSummary, TPagination } from "@/types/globalTypes";
import { RootState } from "../store";

export const driverApi = createApi({
  reducerPath: "driverApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Drivers","DriverSummary"],

  endpoints: (builder) => ({
    // 🔹 Get all drivers
    getDrivers: builder.query<
      { data: TDriver[]; paginationResult: TPagination },
      number | void
    >({
      query: (page = 1) => `/drivers?page=${page}`,
      providesTags: ["Drivers"],
    }),

    // 🔹 Get all drivers without pagination
    getAllDrivers: builder.query<{ data: TDriver[] }, void>({
      query: () => `/drivers?limit=50`,
      providesTags: ["Drivers"],
    }),
    getDriverById: builder.query<{ data: TDriver }, string>({
      query: (id) => `/drivers/${id}`,
      providesTags: ["Drivers"],
    }),

    // 🔹 Get driver summary
    getDriverSummary: builder.query<{ data: TLoadSummary }, string>({
      query: (id) => `/summary/driver/${id}`,
      providesTags: ["DriverSummary"],
    }),

    // 🔹 Get driver summary with date filter
    getDriverSummaryWithFilter: builder.query<
      { data: TLoadSummary },
      { id: string; from?: string; to?: string }
    >({
      query: ({ id, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        return `/summary/driver/${id}?${params.toString()}`;
      },
      providesTags: ["DriverSummary"],
    }),


    // 🔹 Create driver
    createDriver: builder.mutation<{ data: TDriver }, Partial<TDriver>>({
      query: (body) => ({
        url: `/drivers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Drivers"],
    }),

    // 🔹 Update driver
    updateDriver: builder.mutation<{ data: TDriver }, { id: string; body: Partial<TDriver> }>({
      query: ({ id, body }) => ({
        url: `/drivers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Drivers"],
    }),

    // 🔹 Delete driver
    deleteDriver: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/drivers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Drivers"],
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetAllDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  useGetDriverByIdQuery,
  useGetDriverSummaryQuery,
  useGetDriverSummaryWithFilterQuery,
  useLazyGetDriverSummaryWithFilterQuery
} = driverApi;
