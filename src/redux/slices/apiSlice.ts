// apiSlice.ts
import { api } from "../api/baseApi";

export const apiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get Loads
    getLoads: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/loads?page=${page}&limit=${limit}`,
      providesTags: ["Loads"],
    }),

    // Get All Loads (للبحث)
    getAllLoads: builder.query({
      query: (arg: void) => `/api/v1/loads?limit=50`,
      providesTags: ["Loads"],
    }),

    // Create Load
    createLoads: builder.mutation({
      query: (body) => ({ url: `/api/v1/loads`, method: "POST", body }),
      invalidatesTags: ["Loads"],
    }),

    // Update Load
    updateLoads: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/loads/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loads"],
    }),

    // Upload Documents
    uploadDocuments: builder.mutation({
      query: (formData) => ({
        url: `/api/v1/upload`,
        method: "POST",
        documents: formData,
      }),
    }),

    // Update Load Status
    updateLoadsStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/loads/status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loads"],
    }),

    // Get Drivers
    getDrivers: builder.query({
      query: (arg: void) => `/api/v1/drivers?status=available`,
      providesTags: ["Drivers"],
    }),

    // Get Trucks
    getTrucks: builder.query({
      query: (arg: void) => `/api/v1/trucks?status=available`,
      providesTags: ["Trucks"],
    }),

    // Add Note
    addNote: builder.mutation({
      query: ({ loadId, ...body }) => ({
        url: `/api/v1/comments/${loadId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comments"],
    }),

    // Get Notes
    getNotes: builder.query({
      query: (loadId) => `/api/v1/comments/${loadId}`,
      providesTags: (result, error, loadId) => [
        { type: "Comments", id: loadId },
      ],
    }),

    // Get All Dispatchers
    getAllDispatchers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/adminDashboard?page=${page}&limit=${limit}`,
      providesTags: ["Dispatchers"],
    }),

    // Create Dispatcher (User)
    createUser: builder.mutation({
      query: (body) => ({
        url: `/api/v1/adminDashboard`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dispatchers"],
    }),

    // Update User Role
    updateUserRole: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/adminDashboard/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Dispatchers"],
    }),

    // Activate User
    activateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/adminDashboard/activate/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Dispatchers"],
    }),

    // Deactivate User
    deactivateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/adminDashboard/deactivate/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Dispatchers"],
    }),


  }),
});

export const {
  useGetLoadsQuery,
  useGetAllLoadsQuery,
  useCreateLoadsMutation,
  useUpdateLoadsMutation,
  useUpdateLoadsStatusMutation,
  useGetDriversQuery,
  useGetTrucksQuery,
  useAddNoteMutation,
  useGetNotesQuery,
  useGetAllDispatchersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} = apiSlice;
