import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TTruck, TStatusDriver, TruckApiResponse } from '@/types/globalTypes';
import { RootState } from '../store';

interface TrucksState {
  trucks: TTruck[];
  availableTrucks: TTruck[];
  loading: boolean;
  error: string | null;
}

const initialState: TrucksState = {
  trucks: [],
  availableTrucks: [],
  loading: false,
  error: null,
};

export const fetchTrucks = createAsyncThunk(
  'trucks/fetchTrucks',
  async (params: { status?: TStatusDriver } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      
      let url = `${apiURL}/api/v1/trucks`;
      if (params.status) url += `?status=${params.status}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch trucks');

      const result: TruckApiResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

const trucksSlice = createSlice({
  name: 'trucks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrucks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrucks.fulfilled, (state, action) => {
        state.loading = false;
        state.trucks = action.payload.data || [];
        state.availableTrucks = action.payload.data?.filter((truck: TTruck) => 
          truck.status === 'available'
        ) || [];
      })
      .addCase(fetchTrucks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = trucksSlice.actions;
export default trucksSlice.reducer;