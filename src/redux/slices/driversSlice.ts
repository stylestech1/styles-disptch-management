import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { TDriver, TStatusDriver } from "@/types/globalTypes";
import { RootState } from "../store";

interface DriversState {
  drivers: TDriver[];
  availableDrivers: TDriver[];
  loading: boolean;
  error: string | null;
}

const initialState: DriversState = {
  drivers: [],
  availableDrivers: [],
  loading: false,
  error: null,
};

export const fetchDrivers = createAsyncThunk(
  "drivers/fetchDrivers",
  async (
    params: { status?: TStatusDriver } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const apiURL = process.env.NEXT_PUBLIC_API_URL;

      let url = `${apiURL}/api/v1/drivers`;
      if (params.status) url += `?status=${params.status}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch drivers");

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload.data || [];
        state.availableDrivers =
          action.payload.data?.filter(
            (driver: TDriver) => driver.status === "available"
          ) || [];
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = driversSlice.actions;
export default driversSlice.reducer;
