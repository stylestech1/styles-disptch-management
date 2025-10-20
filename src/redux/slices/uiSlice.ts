import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TLoads } from '@/types/globalTypes';

interface UiState {
  popups: {
    load: boolean;
    loadStatus: boolean;
    note: boolean;
    allNotes: boolean;
    allAppointments: boolean;
  };
  activeTab: number;
  selectedLoadId: string;
  selectedLoadForNotes: TLoads | null;
  selectedLoadForAppointments: TLoads | null;
  editingLoad: TLoads | null;
  isEditing: boolean;
}

const initialState: UiState = {
  popups: {
    load: false,
    loadStatus: false,
    note: false,
    allNotes: false,
    allAppointments: false,
  },
  activeTab: 1,
  selectedLoadId: '',
  selectedLoadForNotes: null,
  selectedLoadForAppointments: null,
  editingLoad: null,
  isEditing: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPopup: (state, action: PayloadAction<{ popup: keyof UiState['popups']; value: boolean }>) => {
      state.popups[action.payload.popup] = action.payload.value;
    },
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload;
    },
    setSelectedLoadId: (state, action: PayloadAction<string>) => {
      state.selectedLoadId = action.payload;
    },
    setSelectedLoadForNotes: (state, action: PayloadAction<TLoads | null>) => {
      state.selectedLoadForNotes = action.payload;
    },
    setSelectedLoadForAppointments: (state, action: PayloadAction<TLoads | null>) => {
      state.selectedLoadForAppointments = action.payload;
    },
    setEditingLoad: (state, action: PayloadAction<{ load: TLoads | null; isEditing: boolean }>) => {
      state.editingLoad = action.payload.load;
      state.isEditing = action.payload.isEditing;
    },
    closeAllPopups: (state) => {
      Object.keys(state.popups).forEach(key => {
        state.popups[key as keyof UiState['popups']] = false;
      });
      state.activeTab = 1;
      state.selectedLoadId = '';
      state.selectedLoadForNotes = null;
      state.selectedLoadForAppointments = null;
      state.editingLoad = null;
      state.isEditing = false;
    },
    resetUiState: () => initialState,
  },
});

export const {
  setPopup,
  setActiveTab,
  setSelectedLoadId,
  setSelectedLoadForNotes,
  setSelectedLoadForAppointments,
  setEditingLoad,
  closeAllPopups,
  resetUiState,
} = uiSlice.actions;

export default uiSlice.reducer;