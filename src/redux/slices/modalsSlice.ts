import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalsState, TLoads } from '@/types/globalTypes';

const initialState: ModalsState = {
  createEditLoadModal: false,
  updateStatusModal: false,
  addNoteModal: false,
  viewNotesModal: false,
  viewAppointmentsModal: false,
  
  selectedLoadId: '',
  selectedLoadForNotes: null,
  selectedLoadForAppointments: null,
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    // Create/Edit Load Modal
    openCreateEditLoadModal: (state) => {
      state.createEditLoadModal = true;
    },
    
    closeCreateEditLoadModal: (state) => {
      state.createEditLoadModal = false;
    },
    
    // Update Status Modal
    openUpdateStatusModal: (state) => {
      state.updateStatusModal = true;
    },
    
    closeUpdateStatusModal: (state) => {
      state.updateStatusModal = false;
      state.selectedLoadId = '';
    },
    
    setSelectedLoadId: (state, action: PayloadAction<string>) => {
      state.selectedLoadId = action.payload;
    },
    
    // Add Note Modal
    openAddNoteModal: (state) => {
      state.addNoteModal = true;
    },
    
    closeAddNoteModal: (state) => {
      state.addNoteModal = false;
      state.selectedLoadId = '';
    },
    
    // View Notes Modal
    openViewNotesModal: (state) => {
      state.viewNotesModal = true;
    },
    
    closeViewNotesModal: (state) => {
      state.viewNotesModal = false;
      state.selectedLoadForNotes = null;
    },
    
    setSelectedLoadForNotes: (state, action: PayloadAction<TLoads | null>) => {
      state.selectedLoadForNotes = action.payload;
    },
    
    // View Appointments Modal
    openViewAppointmentsModal: (state) => {
      state.viewAppointmentsModal = true;
    },
    
    closeViewAppointmentsModal: (state) => {
      state.viewAppointmentsModal = false;
      state.selectedLoadForAppointments = null;
    },
    
    setSelectedLoadForAppointments: (state, action: PayloadAction<TLoads | null>) => {
      state.selectedLoadForAppointments = action.payload;
    },
    
    // Close All Modals
    closeAllModals: (state) => {
      state.createEditLoadModal = false;
      state.updateStatusModal = false;
      state.addNoteModal = false;
      state.viewNotesModal = false;
      state.viewAppointmentsModal = false;
      state.selectedLoadId = '';
      state.selectedLoadForNotes = null;
      state.selectedLoadForAppointments = null;
    },
  },
});

export const {
  openCreateEditLoadModal,
  closeCreateEditLoadModal,
  openUpdateStatusModal,
  closeUpdateStatusModal,
  setSelectedLoadId,
  openAddNoteModal,
  closeAddNoteModal,
  openViewNotesModal,
  closeViewNotesModal,
  setSelectedLoadForNotes,
  openViewAppointmentsModal,
  closeViewAppointmentsModal,
  setSelectedLoadForAppointments,
  closeAllModals,
} = modalsSlice.actions;

export default modalsSlice.reducer;