import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Tab } from "@mui/material";
import { IoLocationOutline, IoDocumentText, IoCar } from "react-icons/io5";

import { setActiveTab } from "@/redux/slices/loadsFormSlice";
import { RootState } from "@/redux/store";
import { useLoadForm } from "../hooks/useLoadForm";

// Import tabs
import LocationsTab from "../tabs/LocationsTab";
import LoadDetailsTab from "../tabs/LoadDetailsTab";
import AssignmentTab from "../tabs/AssignmentTab";
import { TLoads } from "@/types/globalTypes";

interface LoadFormProps {
  editingLoad: TLoads | null;
  onClose: () => void;
}

const LoadForm: React.FC<LoadFormProps> = ({ editingLoad, onClose }) => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state: RootState) => state.loadsForm);
  
  const {
    // Form state and handlers
    formState,
    handleSubmit,
    handleCreateLoad,
    
    // Validations
    isTab1Valid,
    isTab2Valid,
    isTab3Valid,
    
    // Loading states
    isLoading,
    
    // File handling
    fileHandlers,
    
    // Dispatch functions
    dispatchFunctions,
  } = useLoadForm(editingLoad, onClose);

  const renderTabContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <LocationsTab
            {...formState.locations}
            dispatchFunctions={dispatchFunctions}
            onNextTab={() => dispatch(setActiveTab(2))}
            isTabValid={isTab1Valid}
          />
        );
      case 2:
        return (
          <LoadDetailsTab
            {...formState.details}
            fileHandlers={fileHandlers}
            dispatchFunctions={dispatchFunctions}
            onPrevTab={() => dispatch(setActiveTab(1))}
            onNextTab={() => dispatch(setActiveTab(3))}
            isTabValid={isTab2Valid}
          />
        );
      case 3:
        return (
          <AssignmentTab
            {...formState.assignment}
            editingLoad={editingLoad}
            dispatchFunctions={dispatchFunctions}
            onPrevTab={() => dispatch(setActiveTab(2))}
            isTabValid={isTab3Valid}
            isLoading={isLoading}
            onSubmit={handleCreateLoad}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => dispatch(setActiveTab(newValue))}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            minHeight: "64px",
          },
        }}
      >
        <Tab
          value={1}
          label={
            <span className="flex items-center">
              <IoLocationOutline className="mr-2" />
              Locations
            </span>
          }
          sx={{
            color: activeTab === 1 ? "#10b981" : "#64748b",
            "&.Mui-selected": { color: "#10b981" },
          }}
        />
        <Tab
          value={2}
          label={
            <span className="flex items-center">
              <IoDocumentText className="mr-2" />
              Load Details
            </span>
          }
          sx={{
            color: activeTab === 2 ? "#10b981" : "#64748b",
            "&.Mui-selected": { color: "#10b981" },
          }}
        />
        <Tab
          value={3}
          label={
            <span className="flex items-center">
              <IoCar className="mr-2" />
              Ride
            </span>
          }
          sx={{
            color: activeTab === 3 ? "#10b981" : "#64748b",
            "&.Mui-selected": { color: "#10b981" },
          }}
        />
      </Tabs>

      {/* Tab Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
        {renderTabContent()}
      </form>
    </div>
  );
};

export default LoadForm;