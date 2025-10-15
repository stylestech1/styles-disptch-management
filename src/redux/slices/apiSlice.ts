import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query";
import type {
  TLoads,
  TDriver,
  TTruck,
  CommentsResponse,
  TDispatcher,
  ApiResponse,
  TPagination,
  TSetting,
  TDriverLoadSummary,
  TTruckLoadSummary,
  TStatusLoad,
  TComments,
} from "@/types/globalTypes";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/proxy/api/v1/",
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined"
        ? document.cookie.match(/token=([^;]+)/)?.[1]
        : null;

    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  const res = await rawBaseQuery(args, api, extraOptions);

  if (res.error) {
    const data = res.error.data as ApiResponse<unknown> | undefined;
    const message =
      data?.message ||
      data?.errors?.map((e) => e.msg).join(", ") ||
      "Request failed";

    return { error: { status: res.error.status, message } };
  }

  return { data: res.data };
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Auth",
    "Users",
    "Drivers",
    "Trucks",
    "Loads",
    "Comments",
    "Profile",
    "Settings",
    "Summaries",
  ],
  endpoints: (builder) => ({
    // 🔐 AUTH
    signUp: builder.mutation<ApiResponse<TDispatcher>, Partial<TDispatcher>>({
      query: (body) => ({ url: "auth/signUp", method: "POST", body }),
    }),
    logIn: builder.mutation<
      ApiResponse<{ token: string; user: TDispatcher }>,
      { email: string; password: string }
    >({
      query: (body) => ({ url: "auth/logIn", method: "POST", body }),
    }),
    changeMyPassword: builder.mutation<
      ApiResponse<{ token: string }>,
      {
        currentPassword: string;
        newPassword: string;
        newPasswordConfirm: string;
      }
    >({
      query: (body) => ({ url: "updatePassword", method: "PUT", body }),
    }),

    // 👑 ADMIN DASHBOARD
    createUser: builder.mutation<
      ApiResponse<TDispatcher>,
      Partial<TDispatcher>
    >({
      query: (body) => ({ url: "adminDashboard", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    getAllUsers: builder.query<
      ApiResponse<{ users: TDispatcher[]; paginationResult: TPagination }>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `adminDashboard?page=${page}&limit=${limit}`,
      providesTags: ["Users"],
    }),

    // 👤 USER DASHBOARD
    getMyData: builder.query<ApiResponse<TDispatcher>, void>({
      query: () => `userDashboard/getMyData`,
      providesTags: ["Profile"],
    }),

    // 🚚 DRIVERS
    getAllDrivers: builder.query<ApiResponse<TDriver[]>, void>({
      query: () => `drivers`,
      providesTags: ["Drivers"],
    }),

    // 🚛 TRUCKS
    getAllTrucks: builder.query<ApiResponse<TTruck[]>, void>({
      query: () => `trucks`,
      providesTags: ["Trucks"],
    }),

    // 📦 LOADS
    getAllLoads: builder.query<
      ApiResponse<TLoads[]>,
      { status?: string; page?: number; limit?: number }
    >({
      query: ({ status, page = 1, limit = 10 }) =>
        status
          ? `loads?status=${status}&page=${page}&limit=${limit}`
          : `loads?page=${page}&limit=${limit}`,
      providesTags: ["Loads"],
    }),
    createLoad: builder.mutation<ApiResponse<TLoads>, Partial<TLoads>>({
      query: (body) => ({ url: "loads", method: "POST", body }),
      invalidatesTags: ["Loads"],
    }),
    updateLoad: builder.mutation<
      ApiResponse<TLoads>,
      { id: string; body: Partial<TLoads> }
    >({
      query: ({ id, body }) => ({
        url: `loads/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loads"],
    }),
    updateLoadStatus: builder.mutation<
      ApiResponse<TLoads>,
      { id: string; body: { status: TStatusLoad; deliveredAt?: string } }
    >({
      query: ({ id, body }) => ({
        url: `loads/status/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Loads"],
    }),

    // 💬 COMMENTS
    getCommentsForLoad: builder.query<ApiResponse<CommentsResponse>, string>({
      query: (loadId) => `loads/${loadId}/comments`,
      providesTags: ["Comments"],
    }),
    addComment: builder.mutation<
      ApiResponse<TComments>,
      { loadId: string; body: { text: string; type: "dispatcher" | "driver" } }
    >({
      query: ({ loadId, body }) => ({
        url: `loads/${loadId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Comments"],
    }),

    // ⚙️ SETTINGS
    getSettings: builder.query<ApiResponse<TSetting>, void>({
      query: () => `settings`,
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<ApiResponse<TSetting>, Partial<TSetting>>({
      query: (body) => ({ url: `settings`, method: "PUT", body }),
      invalidatesTags: ["Settings"],
    }),

    // 📊 SUMMARIES
    getDriverSummary: builder.query<ApiResponse<TDriverLoadSummary>, string>({
      query: (driverId) => `loads/driver-summary/${driverId}`,
      providesTags: ["Summaries"],
    }),
    getTruckSummary: builder.query<ApiResponse<TTruckLoadSummary>, string>({
      query: (truckId) => `trucks/truck-summary/${truckId}`,
      providesTags: ["Summaries"],
    }),
  }),
});

export const {
  useSignUpMutation,
  useLogInMutation,
  useChangeMyPasswordMutation,
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetMyDataQuery,
  useGetAllDriversQuery,
  useGetAllTrucksQuery,
  useGetAllLoadsQuery,
  useGetCommentsForLoadQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetDriverSummaryQuery,
  useGetTruckSummaryQuery,
  useCreateLoadMutation,
  useUpdateLoadMutation,
  useUpdateLoadStatusMutation,
  useAddCommentMutation,
} = apiSlice;
