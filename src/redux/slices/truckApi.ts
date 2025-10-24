import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TPagination, TTruck, TTruckSummary } from "@/types/globalTypes";
import { RootState } from "../store";

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const truckApi = createApi({
  reducerPath: "trucksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiURL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Truck", "TruckSummary"],

  endpoints: (builder) => ({
    // ✅ Get trucks with pagination + optional search
    getTrucks: builder.query<
      { data: { data: TTruck[]; paginationResult?: TPagination } },
      { page?: number; search?: string }
    >({
      query: ({ page = 1, search } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (search && search.trim().length) params.set("search", search.trim());
        return `/trucks?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.data.map((t: TTruck) => ({
              type: "Truck" as const,
              id: t.id,
            })),
            { type: "Truck", id: "LIST" },
          ]
          : [{ type: "Truck", id: "LIST" }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Get all trucks (for search/filter across all)
    getAllTrucks: builder.query<{ data: { data: TTruck[] } }, void>({
      query: () => `/trucks?limit=50`,
      providesTags: (result) =>
        result
          ? [
            ...result.data.data.map((t: TTruck) => ({
              type: "Truck" as const,
              id: t.id,
            })),
            { type: "Truck", id: "ALL_LIST" },
          ]
          : [{ type: "Truck", id: "ALL_LIST" }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Get truck summary 
    getTruckSummary: builder.query<{ data: TTruckSummary }, string>({
      query: (id) => `/summary/truck/${id}`,
      providesTags: (result, error, id) => [
        { type: "TruckSummary", id },
      ],
      keepUnusedDataFor: 60 * 60,
    }),
 
    // ✅ Get single truck by ID
    getTruckById: builder.query<{ data: TTruck }, string>({
      query: (id) => `/trucks/${id}`,
      providesTags: (result, error, id) => [{ type: "Truck", id }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Create / Update / Delete
    createTruck: builder.mutation({
      query: (body) => ({ url: "/trucks", method: "POST", body }),
      invalidatesTags: [
        { type: "Truck", id: "LIST" },
        { type: "Truck", id: "ALL_LIST" },
      ],
    }),

    updateTruck: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/trucks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Truck", id },
        { type: "Truck", id: "LIST" },
        { type: "Truck", id: "ALL_LIST" },
        { type: "TruckSummary", id },
      ],
    }), 

    deleteTruck: builder.mutation({
      query: (id) => ({ url: `/trucks/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Truck", id },
        { type: "Truck", id: "LIST" },
        { type: "Truck", id: "ALL_LIST" },
        { type: "TruckSummary", id },
      ],
    }),
  }),
});

export const {
  useGetTrucksQuery,
  useGetAllTrucksQuery,
  useGetTruckSummaryQuery,
  useGetTruckByIdQuery,
  useCreateTruckMutation,
  useUpdateTruckMutation,
  useDeleteTruckMutation,
  useLazyGetTruckSummaryQuery,
} = truckApi;
