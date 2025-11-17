import {
  TCustomer,
  TDriver,
  TLoadSummary,
  TTrucksSummaryResponse,
  TTruckSummaryResponse,
  TTruckWithSummary,
} from "@/types/globalTypes";
import { api } from "../api/baseApi";
import { TPaletteConfig, TUpdatePaletteRequest } from "@/types/themeType";

export const apiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // ! ========== Loads Methods ==========
    // Get Loads
    getLoads: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/loads?page=${page}&limit=${limit}`,
      providesTags: ["Loads", "Drivers", "Trucks"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // Get All Loads
    getAllLoads: builder.query({
      query: () => `/api/v1/loads`,
      providesTags: ["Loads"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // Get Loads Using Id
    getLoadById: builder.query({
      query: (loadId) => `/api/v1/loads?loadId=${loadId}`,
      providesTags: (result, error, loadId) => [{ type: "Loads", id: loadId }],
    }),

    // Get Loads with Filter and Search
    getLoadsWithFilter: builder.query({
      query: ({ from, to, page, limit }) => {
        const params = [`page=${page}`, `limit=${limit}`];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        const queryString = params.join("&");
        return `/api/v1/loads?${queryString}`;
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
      query: () => `/api/v1/drivers?status=available`,
      providesTags: ["Drivers"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // Get User has driver role
    getUserDriverRole: builder.query({
      query: (email) => {
        const url = `/api/v1/adminDashboard?limit=50`;
        const params = [];
        if (email) params.push(`&email=${email}`);
        return url;
      },
      providesTags: ["Drivers"],
    }),

    // 🔹 Get all drivers with Pagination
    getDriversWithPagination: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/drivers?page=${page}&limit=${limit}`,
      providesTags: ["Drivers"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // 🔹 Get all drivers without pagination
    getAllDrivers: builder.query<{ data: TDriver[] }, void>({
      query: () => `/api/v1/drivers?limit=50`,
      providesTags: ["Drivers"],
    }),

    // Get driver using Id
    getDriverByDriverId: builder.query<{ data: TDriver }, string>({
      query: (driverId) => `/api/v1/drivers?driverId=${driverId}`,
      providesTags: (result, error, driverId) => [
        { type: "Drivers", id: driverId },
      ],
    }),
    getDriverById: builder.query<{ data: TDriver }, string>({
      query: (id) => `/api/v1/drivers/${id}`,
      providesTags: ["Drivers"],
    }),

    // Get Driver with Filter and Search
    getDriverWithFilter: builder.query({
      query: ({ from, to, page, limit }) => {
        const params = [`page=${page}`, `limit=${limit}`];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        const queryString = params.join("&");
        return `/api/v1/drivers?${queryString}`;
      },
      providesTags: ["Drivers"],
    }),

    // 🔹 Get driver summary
    getSpecificDriverSummary: builder.query<{ data: TLoadSummary }, string>({
      query: (id) => `/api/v1/summary/driver/${id}`,
      providesTags: (result, error, id) => [{ type: "DriverSummary", id: id }],
    }),

    // 🔹 Get driver summary with date filter
    getDriverSummaryWithFilter: builder.query({
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
      query: () => `/api/v1/trucks?status=available`,
      providesTags: ["Trucks"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // Get trucks with pagination
    getTrucksWithPagination: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/trucks?page=${page}&limit=${limit}`,
      providesTags: ["Trucks"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // Get All Trucks for Search
    getAllTrucks: builder.query({
      query: () => `/api/v1/trucks?limit=50`,
      providesTags: ["Trucks"],
    }),

    // Get Truck with Filter and Search
    getTruckWithSearch: builder.query({
      query: ({ from, to, page, limit }) => {
        const params = [`page=${page}`, `limit=${limit}`];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        const queryString = params.join("&");
        return `/api/v1/drivers?${queryString}`;
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
    getSpecificTruckSummary: builder.query<
      { data: TTruckSummaryResponse },
      string
    >({
      query: (id) => `/api/v1/summary/truck/${id}`,
      providesTags: (result, error, id) => [{ type: "TruckSummary", id }],
      keepUnusedDataFor: 60 * 60,
    }),

    // ✅ Get truck summary with date filter
    getTruckSummaryWithFilter: builder.query<
      { data: TTruckSummaryResponse },
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

    // ✅ Get single truck by TruckID
    getTruckByTruckId: builder.query({
      query: (truckId) => `/api/v1/trucks?truckId=${truckId}`,
      providesTags: (result, error, truckId) => [{ type: "Trucks", truckId }],
    }),

    // ✅ Get single truck by ID
    getTruckById: builder.query({
      query: (id) => `/api/v1/trucks/${id}`,
      providesTags: ["Trucks"],
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

    // Get All Users with Pagination
    getAllDispatchers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/adminDashboard?page=${page}&limit=${limit}`,
      providesTags: ["Dispatchers"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // Get Users Using Id
    getUserById: builder.query({
      query: (jobId) => `/api/v1/adminDashboard?jobId=${jobId}`,
      providesTags: (result, error, jobId) => [
        { type: "Dispatchers", id: jobId },
      ],
    }),

    // Get User with Filter and Search
    getUserWithSearch: builder.query({
      query: ({ from, to, page, limit }) => {
        const params = [`page=${page}`, `limit=${limit}`];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        const queryString = params.join("&");
        return `/api/v1/adminDashboard?${queryString}`;
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
      keepUnusedDataFor: 60 * 60 * 24
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

    getPalette: builder.query<TPaletteConfig[], void>({
      query: () => `/api/v1/ui-settings/palette`,
      providesTags: ["Palette"],
    }),

    createPalette: builder.mutation<TPaletteConfig, TPaletteConfig>({
      query: (body) => ({
        url: "/api/v1/ui-settings/palette",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Palette"],
    }),

    updatePalette: builder.mutation<TPaletteConfig, TUpdatePaletteRequest>({
      query: ({ _id, ...body }) => ({
        url: `/api/v1/ui-settings/palette/${_id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Palette"],
    }),

    deletePalette: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/api/v1/ui-settings/palette/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Palette"],
    }),

    // ! ========== Customer Methods ==========

    getCustomerById: builder.query({
      query: (customerId) => `/api/v1/customers?customerId=${customerId}`,
      providesTags: (result, error, customerId) => [
        { type: "Customers", id: customerId },
      ],
    }),

    // Get Customer with Filter and Search
    getCustomerWithFilter: builder.query({
      query: ({ from, to, page, limit }) => {
        const params = [`page=${page}`, `limit=${limit}`];

        if (from) params.push(`from=${from}`);
        if (to) params.push(`to=${to}`);

        const queryString = params.join("&");
        return `/api/v1/customers?${queryString}`;
      },
      providesTags: ["Customers"],
    }),

    // 🔹 Get all Customers with Pagination
    getCustomersWithPagination: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/api/v1/customers?page=${page}&limit=${limit}`,
      providesTags: ["Customers"],
      keepUnusedDataFor: 60 * 60 * 24
    }),

    // 🔹 Create Customer
    createCustomer: builder.mutation<{ data: TCustomer }, Partial<TCustomer>>({
      query: (body) => ({
        url: `/api/v1/customers`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customers"],
    }),

    // 🔹 Update customer
    updateCustomer: builder.mutation<
      { data: TCustomer },
      { id: string; body: Partial<TCustomer> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/customers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Customers"],
    }),

    // 🔹 Delete Customer
    deleteCustomer: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/v1/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  // TODO: ----- Loads -----
  useGetLoadsQuery,
  useGetAllLoadsQuery,
  useGetLoadByIdQuery,
  useLazyGetLoadByIdQuery,
  useCreateLoadsMutation,
  useUpdateLoadsMutation,
  useUpdateLoadsStatusMutation,
  useGetLoadsWithFilterQuery,
  // TODO: ----- Documents -----
  useUploadDocumentsMutation,
  // TODO: ----- Drivers -----
  useGetDriversQuery,
  useGetUserDriverRoleQuery,
  useGetDriversWithPaginationQuery,
  useGetAllDriversQuery,
  useGetDriverWithFilterQuery,
  useGetDriverByIdQuery,
  useGetDriverByDriverIdQuery,
  useLazyGetDriverByIdQuery,
  useLazyGetDriverByDriverIdQuery,
  useGetSpecificDriverSummaryQuery,
  useLazyGetSpecificDriverSummaryQuery,
  useGetDriverSummaryWithFilterQuery,
  useLazyGetDriverSummaryWithFilterQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
  // TODO: ----- Trucks -----
  useGetTrucksQuery,
  useGetTrucksWithPaginationQuery,
  useGetAllTrucksQuery,
  useGetTruckSummaryQuery,
  useGetTruckWithSearchQuery,
  useLazyGetSpecificTruckSummaryQuery,
  useGetTruckSummaryWithFilterQuery,
  useGetTruckByIdQuery,
  useGetTruckByTruckIdQuery,
  useLazyGetTruckByIdQuery,
  useLazyGetTruckByTruckIdQuery,
  useCreateTruckMutation,
  useUpdateTruckMutation,
  useDeleteTruckMutation,
  // TODO: ----- Notes -----
  useAddNoteMutation,
  useGetNotesQuery,
  // TODO: ----- Users-----
  useGetAllDispatchersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetUserWithSearchQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserInfoQuery,
  useUpdateUserInfoMutation,
  // TODO: ----- Password -----
  useUpdateUserPasswordMutation,
  // TODO: ----- Palette -----
  useGetPaletteQuery,
  useCreatePaletteMutation,
  useUpdatePaletteMutation,
  // TODO: ----- Customer -----
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useGetCustomerWithFilterQuery,
  useGetCustomersWithPaginationQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = apiSlice;
