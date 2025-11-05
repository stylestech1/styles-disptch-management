import {
  TDriver,
  TLoadSummary,
  TPagination,
  TTruck,
  TTrucksSummaryResponse,
  TTruckSummary,
  TTruckWithSummary,
} from "@/types/globalTypes";
import { api } from "../api/baseApi";
import { TPaletteConfig } from "@/types/themeType";

export const apiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ! ========== Loads Methods ==========
    // Get Loads
    getLoads: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/loads?page=${page}&limit=${limit}`,
      providesTags: ["Loads", "Drivers", "Trucks"],
    }),

    // Get All Loads
    getAllLoads: builder.query({
      query: (arg: void) => `/api/v1/loads?limit=50`,
      providesTags: ["Loads"],
    }),

    // Get Loads Using Id
    getLoadById: builder.query({
      query: (loadId) => `/api/v1/loads?loadId=${loadId}`,
      providesTags: (result, error, loadId) => [{ type: "Loads", id: loadId }],
    }),

    // Get Loads with Filter and Search
    getLoadsWithFilter: builder.query({
      query: ({ from, to }) => {
        let url = `/api/v1/loads`;
        const params = [];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        if (params.length) url += `?${params.join("&")}`;
        return url;
      },
      providesTags: ["Loads"],
    }),

    // Create Load
    createLoads: builder.mutation({
      query: (formData) => ({
        url: `/api/v1/loads`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Loads"],
    }),

    // Update Load
    updateLoads: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/loads/update/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Loads"],
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

    // ! ========== Documents Methods ==========

    // Upload Documents
    uploadDocuments: builder.mutation({
      query: ({ formData }) => ({
        url: `/api/v1/loads`,
        method: "POST",
        body: formData,
      }),
    }),

    // ! ========== Drivers Methods ==========

    // Get Drivers
    getDrivers: builder.query({
      query: (arg: void) => `/api/v1/drivers?status=available`,
      providesTags: ["Drivers"],
    }),

    // 🔹 Get all drivers with Pagination
    getDriversWithPagination: builder.query<
      { data: TDriver[]; paginationResult: TPagination },
      number | void
    >({
      query: (page = 1) => `/api/v1/drivers?page=${page}`,
      providesTags: ["Drivers"],
    }),

    // 🔹 Get all drivers without pagination
    getAllDrivers: builder.query<{ data: TDriver[] }, void>({
      query: () => `/api/v1/drivers?limit=50`,
      providesTags: ["Drivers"],
    }),
    getDriverById: builder.query<{ data: TDriver }, string>({
      query: (id) => `/api/v1/drivers/${id}`,
      providesTags: ["Drivers"],
    }),

    // Get Driver with Filter and Search
    getDriverWithFilter: builder.query({
      query: ({ from, to }) => {
        let url = `/api/v1/drivers`;
        const params = [];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        if (params.length) url += `?${params.join("&")}`;
        return url;
      },
      providesTags: ["Drivers"],
    }),

    // 🔹 Get driver summary
    getSpecificDriverSummary: builder.query<{ data: TLoadSummary }, string>({
      query: (id) => `/api/v1/summary/driver/${id}`,
      providesTags: ["DriverSummary"],
    }),

    // 🔹 Get driver summary with date filter
    getDriverSummaryWithFilter: builder.query<
      { data: TLoadSummary },
      { id: string; from?: string; to?: string }
    >({
      query: ({ id, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/api/v1/summary/driver/${id}?${params.toString()}`;
      },
      providesTags: ["DriverSummary"],
    }),

    // 🔹 Create driver
    createDriver: builder.mutation<{ data: TDriver }, Partial<TDriver>>({
      query: (body) => ({
        url: `/api/v1/drivers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Drivers"],
    }),

    // 🔹 Update driver
    updateDriver: builder.mutation<
      { data: TDriver },
      { id: string; body: Partial<TDriver> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/drivers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Drivers"],
    }),

    // 🔹 Delete driver
    deleteDriver: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/drivers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Drivers"],
    }),

    // ! ========== Trucks Methods ==========

    // Get Trucks
    getTrucks: builder.query({
      query: (arg: void) => `/api/v1/trucks?status=available`,
      providesTags: ["Trucks"],
    }),

    // Get trucks with pagination
    getTrucksWithSearch: builder.query<
      { data: { data: TTruck[]; paginationResult?: TPagination } },
      { page?: number; search?: string }
    >({
      query: ({ page = 1, search } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (search && search.trim().length) params.set("search", search.trim());
        return `/api/v1/trucks?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.data.map((t: TTruck) => ({
                type: "Trucks" as const,
                id: t.id,
              })),
              { type: "Trucks", id: "LIST" },
            ]
          : [{ type: "Trucks", id: "LIST" }],
      keepUnusedDataFor: 60 * 60,
    }),

    // Get All Trucks for Search
    getAllTrucks: builder.query({
      query: () => `/api/v1/trucks?limit=50`,
      providesTags: ["Trucks"],
    }),

    // Get Truck with Filter and Search
    getTruckWithSearch: builder.query({
      query: ({ from, to }) => {
        let url = `/api/v1/trucks`;
        const params = [];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        if (params.length) url += `?${params.join("&")}`;
        return url;
      },
      providesTags: ["Trucks"],
    }),

    // Get All Trucks With Summaries (For Dashboard)
    getTruckSummary: builder.query<TTrucksSummaryResponse, void>({
      query: () => `/api/v1/summary/truck`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.trucksSummary.map((t: TTruckWithSummary) => ({
                type: "Trucks" as const,
                id: t.id,
              })),
              { type: "TruckSummary", id: "LIST" },
            ]
          : [{ type: "TruckSummary", id: "LIST" }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Get specific truck summary
    getSpecificTruckSummary: builder.query<{ data: TTruckSummary }, string>({
      query: (id) => `/api/v1/summary/truck/${id}`,
      providesTags: (result, error, id) => [{ type: "TruckSummary", id }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Get truck summary with date filter
    getTruckSummaryWithFilter: builder.query<
      { data: TTruckSummary },
      { id: string; from?: string; to?: string }
    >({
      query: ({ id, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/api/v1/summary/truck/${id}?${params.toString()}`;
      },
      providesTags: (result, error, { id }) => [{ type: "TruckSummary", id }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Get single truck by ID
    getTruckById: builder.query<{ data: TTruck }, string>({
      query: (id) => `/api/v1/trucks/${id}`,
      providesTags: (result, error, id) => [{ type: "Trucks", id }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Create / Update / Delete
    createTruck: builder.mutation({
      query: (body) => ({ url: "/api/v1/trucks", method: "POST", body }),
      invalidatesTags: [
        { type: "Trucks", id: "LIST" },
        { type: "TruckSummary", id: "LIST" },
      ],
    }),

    updateTruck: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/trucks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Trucks", id },
        { type: "Trucks", id: "LIST" },
        { type: "TruckSummary", id: "LIST" },
        { type: "TruckSummary", id },
      ],
    }),

    deleteTruck: builder.mutation({
      query: (id) => ({ url: `/api/v1/trucks/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Trucks", id },
        { type: "Trucks", id: "LIST" },
        { type: "TruckSummary", id: "LIST" },
        { type: "TruckSummary", id },
      ],
    }),

    // ! ========== Notes Methods ==========

    // Add Note
    addNote: builder.mutation({
      query: ({ loadId, ...body }) => ({
        url: `/api/v1/comments/${loadId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comments", "Loads"],
    }),

    // Get Notes
    getNotes: builder.query({
      query: (loadId) => `/api/v1/comments/${loadId}`,
      providesTags: (result, error, loadId) => [
        { type: "Comments", id: loadId },
      ],
    }),

    // ! ========== Users Methods [adminDashboard] ==========

    // Get All Users
    getAllDispatchers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/adminDashboard?page=${page}&limit=${limit}`,
      providesTags: ["Dispatchers"],
    }),
    getAllUsers: builder.query({
      query: ({ role, driver }) => `/api/v1/adminDashboard?role=driver`,
      providesTags: ["Drivers"],
    }),

    // Get User with Filter and Search
    getUserWithSearch: builder.query({
      query: ({ from, to }) => {
        let url = `/api/v1/adminDashboard`;
        const params = [];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        if (params.length) url += `?${params.join("&")}`;
        return url;
      },
      providesTags: ["Dispatchers"],
    }),

    // Create User
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

    // ! ========== Users Methods [userDashboard] ==========

    // Get User Information
    getUserInfo: builder.query({
      query: () => `/api/v1/userDashboard/getMyData`,
      providesTags: ["Users"],
    }),

    // Update User Info
    updateUserInfo: builder.mutation({
      query: ({ ...body }) => ({
        url: `/api/v1/userDashboard/updateMyData`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // ! ========== Password Methods ==========

    // Update User Password
    updateUserPassword: builder.mutation({
      query: (body) => ({
        url: `/api/v1/updatePassword/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // ! ========== Palette Themes ============
    getPalette: builder.query<TPaletteConfig, void>({
      query: () => `/api/v1/palette`,
      providesTags: ["Palette"],
    }),
    updatePalette: builder.mutation<TPaletteConfig, TPaletteConfig>({
      query: (palette) => ({
        url: "/api/v1/palette",
        method: "POST",
        body: palette,
      }),
      invalidatesTags: ["Palette"],
    }),
  }),
});

export const {
  // TODO: ----- Loads -----
  useGetLoadsQuery,
  useGetAllLoadsQuery,
  useGetLoadByIdQuery,
  useCreateLoadsMutation,
  useUpdateLoadsMutation,
  useUpdateLoadsStatusMutation,
  useGetLoadsWithFilterQuery,
  // TODO: ----- Documents -----
  useUploadDocumentsMutation,
  // TODO: ----- Drivers -----
  useGetDriversQuery,
  useGetDriversWithPaginationQuery,
  useGetAllDriversQuery,
  useGetDriverWithFilterQuery,
  useGetDriverByIdQuery,
  useLazyGetSpecificDriverSummaryQuery,
  useGetDriverSummaryWithFilterQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  // TODO: ----- Trucks -----
  useGetTrucksQuery,
  useGetTrucksWithSearchQuery,
  useGetAllTrucksQuery,
  useGetTruckSummaryQuery,
  useGetTruckWithSearchQuery,
  useLazyGetSpecificTruckSummaryQuery,
  useGetTruckSummaryWithFilterQuery,
  useGetTruckByIdQuery,
  useCreateTruckMutation,
  useUpdateTruckMutation,
  useDeleteTruckMutation,
  // TODO: ----- Notes -----
  useAddNoteMutation,
  useGetNotesQuery,
  // TODO: ----- Users-----
  useGetAllDispatchersQuery,
  useGetUserWithSearchQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserInfoQuery,
  useUpdateUserInfoMutation,
  // TODO: ----- Password -----
  useUpdateUserPasswordMutation,
  useGetAllUsersQuery,
  // TODO: ----- Palette -----
  useGetPaletteQuery,
  useUpdatePaletteMutation,
} = apiSlice;
