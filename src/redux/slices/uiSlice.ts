import { UIState } from '@/types/globalTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: UIState = {
  search: '',
  page: 1,
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetUI: (state) => {
      state.search = '';
      state.page = 1;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setSearch,
  setPage,
  setLoading,
  setError,
  clearError,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;