// redux/slices/loadsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  TLoads,
  TPagination,
  TComments,
  TStatusLoad,
} from "@/types/globalTypes";
import { RootState } from "../store";

interface LoadsState {
  loads: TLoads[];
  allLoads: TLoads[];
  pagination: TPagination | null;
  loading: boolean;
  error: string | null;
  page: number;
  search: string;
  currentLoad: TLoads | null;
  loadNotes: TComments[];
}

const initialState: LoadsState = {
  loads: [],
  allLoads: [],
  pagination: null,
  loading: false,
  error: null,
  page: 1,
  search: "",
  currentLoad: null,
  loadNotes: [],
};

// Async thunks
export const fetchLoads = createAsyncThunk(
  "loads/fetchLoads",
  async (
    { page, limit = 10 }: { page: number; limit?: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiURL}/api/v1/loads?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch loads");

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

export const fetchAllLoads = createAsyncThunk(
  "loads/fetchAllLoads",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiURL}/api/v1/loads?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch all loads");

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

export const createLoad = createAsyncThunk(
  "loads/createLoad",
  async (loadData: TLoads, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiURL}/api/v1/loads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loadData),
      });

      if (!response.ok) throw new Error("Failed to create load");

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

export const updateLoad = createAsyncThunk(
  "loads/updateLoad",
  async (
    { id, updateData }: { id: string; updateData: TLoads },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiURL}/api/v1/loads/update/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error("Failed to update load");

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

export const updateLoadStatus = createAsyncThunk(
  "loads/updateLoadStatus",
  async (
    {
      id,
      status,
      deliveredAt,
    }: { id: string; status: TStatusLoad; deliveredAt?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;

      const bodyData: {
        status: TStatusLoad;
        deliveredAt?: string;
      } = { status };
      if (deliveredAt) bodyData.deliveredAt = deliveredAt;

      const response = await fetch(`${apiURL}/api/v1/loads/status/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) throw new Error("Failed to update load status");

      const result = await response.json();
      return { id, ...result };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchLoadNotes = createAsyncThunk(
  "loads/fetchLoadNotes",
  async (loadId: string, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiURL}/api/v1/loads/${loadId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch load notes");

      const result = await response.json();
      return { loadId, comments: result.comments || [] };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const addLoadNote = createAsyncThunk(
  "loads/addLoadNote",
  async (
    {
      loadId,
      text,
      type,
    }: { loadId: string; text: string; type: "dispatcher" | "driver" },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const apiURL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiURL}/api/v1/loads/${loadId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, type }),
        }
      );

      if (!response.ok) throw new Error("Failed to add note");

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

const loadsSlice = createSlice({
  name: "loads",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLoad: (state, action: PayloadAction<TLoads | null>) => {
      state.currentLoad = action.payload;
    },
    updateLoadInState: (state, action: PayloadAction<TLoads>) => {
      const index = state.loads.findIndex(
        (load) => load.id === action.payload.id
      );
      if (index !== -1) {
        state.loads[index] = action.payload;
      }

      const allIndex = state.allLoads.findIndex(
        (load) => load.id === action.payload.id
      );
      if (allIndex !== -1) {
        state.allLoads[allIndex] = action.payload;
      }
    },
    clearLoadNotes: (state) => {
      state.loadNotes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLoads
      .addCase(fetchLoads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoads.fulfilled, (state, action) => {
        state.loading = false;
        state.loads = action.payload.data || [];
        state.pagination = action.payload.paginationResult || null;
      })
      .addCase(fetchLoads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchAllLoads
      .addCase(fetchAllLoads.fulfilled, (state, action) => {
        state.allLoads = action.payload.data || [];
      })
      // updateLoadStatus
      .addCase(updateLoadStatus.fulfilled, (state, action) => {
        const updatedLoad = action.payload.data;
        if (updatedLoad) {
          const index = state.loads.findIndex(
            (load) => load.id === updatedLoad.id
          );
          if (index !== -1) {
            state.loads[index] = updatedLoad;
          }
        }
      })
      // fetchLoadNotes
      .addCase(fetchLoadNotes.fulfilled, (state, action) => {
        state.loadNotes = action.payload.comments;
      })
      // addLoadNote
      .addCase(addLoadNote.fulfilled, (state, action) => {
        // Optionally add the new note to local state
        if (action.payload.comment) {
          state.loadNotes.push(action.payload.comment);
        }
      });
  },
});

export const {
  setPage,
  setSearch,
  clearError,
  setCurrentLoad,
  updateLoadInState,
  clearLoadNotes,
} = loadsSlice.actions;

export default loadsSlice.reducer;
