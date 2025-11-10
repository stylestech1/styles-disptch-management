import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateLoadsMutation,
  useUpdateLoadsMutation,
} from "@/redux/slices/apiSlice";
import { RootState } from "@/redux/store";
import { TLoads, TTruckType } from "@/types/globalTypes";
import toast from "react-hot-toast";

import { useFileUpload } from "./useFileUpload";
import { validateLoadForm } from "../utils/validation";
import { useDistanceCalculations } from "../utils/calculation";
import {
  setDho,
  setOrigin,
  setDestinations,
  addDestination,
  updateDestination,
  removeDestination,
  setPrice,
  setFees,
  setLoadIDInp,
  setPickupAt,
  setCompletedAt,
  setArrivalAtShipper,
  setArrivalAtReceiver,
  setLeftShipper,
  setLeftReceiver,
  setDriverId,
  setTruckId,
  setTruckType,
  setTruckTemp,
  setIsEditing,
  setEditingLoad,
  resetForm,
} from "@/redux/slices/loadsFormSlice";
import { LoadFormState } from "@/types/loadsTyles";
import { TPlace } from "@/components/sections/LocationAutocomplete";

export const useLoadForm = (
  editingLoad: TLoads | null,
  onClose: () => void
) => {
  const dispatch = useDispatch();
  const formState = useSelector((state: RootState) => state.loadsForm);

  const [createLoad, { isLoading: creatingLoad }] = useCreateLoadsMutation();
  const [updateLoad, { isLoading: updatingLoad }] = useUpdateLoadsMutation();

  // Initialize file upload hook
  const fileHandlers = useFileUpload();

  // Initialize distance calculations
  const distanceCalculations = useDistanceCalculations();

  // Load edit data when modal opens
  useEffect(() => {
    if (editingLoad) {
      dispatch(setIsEditing(true));
      dispatch(setEditingLoad(editingLoad));
      // Here you would load the edit data into the form
    }
  }, [editingLoad, dispatch]);

  // Form validation functions
  const isTab1Valid = useMemo((): boolean => {
    const hasValidDho = formState.dho !== null;
    const hasValidOrigin = formState.origin !== null;
    const hasValidDestinations =
      formState.destinations.length > 0 &&
      formState.destinations.every((dest) => dest !== null);

    return hasValidDho && hasValidOrigin && hasValidDestinations;
  }, [formState.dho, formState.origin, formState.destinations]);

  const isTab2Valid = useMemo((): boolean => {
    const hasValidPrice = formState.price.trim() !== "";
    const hasValidLoadID = formState.loadIDInp.trim() !== "";
    const hasValidPickupAt = formState.pickupAt !== null;
    const hasValidCompletedAt = formState.completedAt !== null;

    return (
      hasValidPrice && hasValidLoadID && hasValidPickupAt && hasValidCompletedAt
    );
  }, [
    formState.price,
    formState.loadIDInp,
    formState.pickupAt,
    formState.completedAt,
  ]);

  const isTab3Valid = useMemo((): boolean => {
    if (formState.isEditing) {
      return true;
    } else {
      const hasValidDriverId = formState.driverId.trim() !== "";
      const hasValidTruckType = formState.truckType.trim() !== "";
      const hasValidTruckId = formState.truckId.trim() !== "";

      return hasValidDriverId && hasValidTruckType && hasValidTruckId;
    }
  }, [
    formState.isEditing,
    formState.driverId,
    formState.truckType,
    formState.truckId,
  ]);

  // Form submission handler
  const handleCreateLoad = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const errors = validateLoadForm(formState, !!editingLoad);
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }

      try {
        const formData = prepareFormData(
          formState,
          fileHandlers.selectedDocuments,
          editingLoad
        );

        if (editingLoad) {
          await updateLoad({ id: editingLoad.id, formData }).unwrap();
          toast.success("Load updated ✅");
        } else {
          await createLoad(formData).unwrap();
          toast.success("Load created ✅");
        }

        handleClose();
      } catch (err: unknown) {
        console.error("❌ Request failed:", err);
        toast.error("Operation failed ❌");
      }
    },
    [
      formState,
      editingLoad,
      fileHandlers.selectedDocuments,
      createLoad,
      updateLoad,
    ]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Handle form submission based on current tab
      handleCreateLoad(e);
    },
    [handleCreateLoad]
  );

  const handleClose = useCallback(() => {
    dispatch(resetForm());
    fileHandlers.setSelectedDocuments([]);
    onClose();
  }, [dispatch, onClose, fileHandlers]);

  // Prepare form data for API
  const prepareFormData = (
    formData: LoadFormState,
    documents: File[],
    editingLoad: TLoads | null
  ) => {
    const submitFormData = new FormData();

    // Add locations
    if (formData.origin?.display_name) {
      submitFormData.append("origin[address]", formData.origin.display_name);
    }

    formData.destinations.forEach((dest: TPlace | null, index: number) => {
      if (dest?.display_name) {
        submitFormData.append(
          `destination[${index}][address]`,
          dest.display_name
        );
      }
    });

    if (formData.dho?.display_name) {
      submitFormData.append("DHO[address]", formData.dho.display_name);
    }

    // Add assignment data (for new loads only)
    if (!editingLoad) {
      if (formData.driverId)
        submitFormData.append("driverId", formData.driverId);
      if (formData.truckId) submitFormData.append("truckId", formData.truckId);
    }

    // Add common fields
    const commonFields = {
      pickupAt: formData.pickupAt,
      completedAt: formData.completedAt,
      arrivalAtShipper: formData.arrivalAtShipper,
      arrivalAtReceiver: formData.arrivalAtReceiver,
      leftShipper: formData.leftShipper,
      leftReceiver: formData.leftReceiver,
      truckTemp: formData.truckTemp,
      truckType: formData.truckType,
      distanceMiles: distanceCalculations.allDistance || "0",
      totalPrice: formData.price,
      pricePerMile: distanceCalculations.pricePerMile?.toString() || "0",
      feesNumber: formData.fees,
      loadId: formData.loadIDInp,
    };

    Object.entries(commonFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        submitFormData.append(key, value.toString());
      }
    });

    // Add documents
    documents.forEach((file) => {
      submitFormData.append("documents", file);
    });

    return submitFormData;
  };

  // Return the complete form API
  return {
    // Form state grouped by tabs
    formState: {
      locations: {
        dho: formState.dho,
        origin: formState.origin,
        destinations: formState.destinations,
        dhoToOriginDistance: distanceCalculations.dhoToOriginDistance,
        averageTime: distanceCalculations.averageTime,
        allDistance: distanceCalculations.allDistance,
        formatTime: distanceCalculations.formatTime,
      },
      details: {
        price: formState.price,
        fees: formState.fees,
        loadIDInp: formState.loadIDInp,
        pickupAt: formState.pickupAt,
        completedAt: formState.completedAt,
        arrivalAtShipper: formState.arrivalAtShipper,
        arrivalAtReceiver: formState.arrivalAtReceiver,
        leftShipper: formState.leftShipper,
        leftReceiver: formState.leftReceiver,
        destinations: formState.destinations,
        isEditing: formState.isEditing,
        pricePerMile: distanceCalculations.pricePerMile,
        allDistance: distanceCalculations.allDistance,
      },
      assignment: {
        driverId: formState.driverId,
        truckId: formState.truckId,
        truckType: formState.truckType,
        truckTemp: formState.truckTemp,
        isEditing: formState.isEditing,
      },
    },

    // Form handlers
    handleSubmit,
    handleCreateLoad,

    // Validation states
    isTab1Valid,
    isTab2Valid,
    isTab3Valid,

    // Loading state
    isLoading: creatingLoad || updatingLoad,

    // File handling
    fileHandlers,

    // Distance calculations
    distanceCalculations,

    // Dispatch functions for form updates
    dispatchFunctions: {
      setDho: (place: TPlace | null) => dispatch(setDho(place)),
      setOrigin: (place: TPlace | null) => dispatch(setOrigin(place)),
      addDestination: () => dispatch(addDestination()),
      updateDestination: (index: number, place: TPlace | null) =>
        dispatch(updateDestination({ index, place })),
      removeDestination: (index: number) => dispatch(removeDestination(index)),
      setPrice: (value: string) => dispatch(setPrice(value)),
      setFees: (value: string) => dispatch(setFees(value)),
      setLoadIDInp: (value: string) => dispatch(setLoadIDInp(value)),
      setPickupAt: (value: string | null) => dispatch(setPickupAt(value)),
      setCompletedAt: (value: string | null) => dispatch(setCompletedAt(value)),
      setArrivalAtShipper: (value: string | null) =>
        dispatch(setArrivalAtShipper(value)),
      setArrivalAtReceiver: (value: string | null) =>
        dispatch(setArrivalAtReceiver(value)),
      setLeftShipper: (value: string | null) => dispatch(setLeftShipper(value)),
      setLeftReceiver: (value: string | null) =>
        dispatch(setLeftReceiver(value)),
      setDriverId: (value: string) => dispatch(setDriverId(value)),
      setTruckId: (value: string) => dispatch(setTruckId(value)),
      setTruckType: (value: TTruckType) => dispatch(setTruckType(value)),
      setTruckTemp: (value: string) => dispatch(setTruckTemp(value)),
    },
  };
};
