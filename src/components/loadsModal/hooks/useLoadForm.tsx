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
import { LoadsFormState } from "@/types/globalTypes";
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

  // Function to create TPlace from string address
  const createTPlaceFromAddress = (address: string): TPlace => {
    return {
      display_name: address,
      lat: "0",
      lon: "0", 
      place_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: {
        [address]: address
      }
    };
  };

  // Function to load edit data into form
  const loadEditData = useCallback((load: TLoads) => {
    console.log('Loading edit data for load:', load.loadId);
    console.log('Load destination data:', load.destination);
    
    // Reset form first to ensure clean state
    dispatch(resetForm());
    
    // Load basic location data
    if (load.origin) {
      const originPlace = createTPlaceFromAddress(load.origin);
      dispatch(setOrigin(originPlace));
    }
    
    if (load.DHO) {
      const dhoPlace = createTPlaceFromAddress(load.DHO);
      dispatch(setDho(dhoPlace));
    }
    
    // Load destinations - handle both string and TPlace formats
    if (load.destination) {
      console.log('Processing destinations:', load.destination);
      
      // If destination is a string, convert to array
      let destArray: (string | TPlace)[] = [];
      
      if (typeof load.destination === 'string') {
        destArray = [load.destination];
      } else if (Array.isArray(load.destination)) {
        destArray = load.destination;
      } else {
        destArray = [load.destination];
      }
      
      console.log('Processed destinations array:', destArray);
      
      // Build array of TPlace objects
      const newDestinations: TPlace[] = destArray.map((dest: string | TPlace) => {
        let destinationPlace: TPlace;
        
        if (typeof dest === 'string') {
          // If it's a string, convert it directly
          destinationPlace = createTPlaceFromAddress(dest);
        } else if (dest && typeof dest === 'object' && 'display_name' in dest) {
          // If it's already a TPlace object, use it
          destinationPlace = dest as TPlace;
        } else {
          // Handle other cases - extract address properly
          const destObj = dest as TPlace;
          let address: string;
          
          if (typeof destObj?.address === 'string') {
            // address is a string
            address = destObj.address;
          } else if (typeof destObj?.address === 'object' && destObj.address) {
            // address is an object, get first value
            address = Object.values(destObj.address)[0] || destObj?.display_name || String(dest);
          } else {
            // fallback to display_name or string conversion
            address = destObj?.display_name || String(dest);
          }
          
          destinationPlace = createTPlaceFromAddress(address);
        }
        
        return destinationPlace;
      });
      
      // Set all destinations at once
      dispatch(setDestinations(newDestinations));
      
      console.log('Final destinations set:', newDestinations);
    }
    
    // Load pricing and details
    if (load.totalPrice !== undefined && load.totalPrice !== null) {
      dispatch(setPrice(load.totalPrice.toString()));
    }
    
    if (load.feesNumber !== undefined && load.feesNumber !== null) {
      dispatch(setFees(load.feesNumber.toString()));
    }
    
    if (load.loadId) {
      dispatch(setLoadIDInp(load.loadId));
    }
    
    // Load dates
    if (load.pickupAt) dispatch(setPickupAt(load.pickupAt));
    if (load.completedAt) dispatch(setCompletedAt(load.completedAt));
    if (load.arrivalAtShipper) dispatch(setArrivalAtShipper(load.arrivalAtShipper));
    if (load.arrivalAtReceiver) dispatch(setArrivalAtReceiver(load.arrivalAtReceiver));
    if (load.leftShipper) dispatch(setLeftShipper(load.leftShipper));
    if (load.leftReceiver) dispatch(setLeftReceiver(load.leftReceiver));
    
    // Load assignment data
    if (load.driverId) {
      const driverIdValue = typeof load.driverId === 'object' ? load.driverId.id : load.driverId;
      if (driverIdValue) dispatch(setDriverId(driverIdValue.toString()));
    }
    
    if (load.truckId) {
      const truckIdValue = typeof load.truckId === 'object' ? load.truckId.truckId : load.truckId;
      if (truckIdValue) dispatch(setTruckId(truckIdValue.toString()));
    }
    
    if (load.truckType) dispatch(setTruckType(load.truckType));
    
    if (load.truckTemp !== undefined && load.truckTemp !== null) {
      dispatch(setTruckTemp(load.truckTemp.toString()));
    }
    
    console.log('Edit data loaded successfully');
  }, [dispatch]);

  // Load edit data when modal opens or editingLoad changes
  useEffect(() => {
    console.log('useLoadForm useEffect - editingLoad:', editingLoad);
    
    if (editingLoad) {
      console.log('Setting up edit mode for load:', editingLoad.loadId);
      dispatch(setIsEditing(true));
      dispatch(setEditingLoad(editingLoad));
      
      // Use setTimeout to ensure React has finished current render cycle
      setTimeout(() => {
        loadEditData(editingLoad);
      }, 100);
    } else {
      console.log('Setting up create mode - resetting form');
      dispatch(setIsEditing(false));
      dispatch(setEditingLoad(null));
      dispatch(resetForm());
    }
  }, [editingLoad, dispatch, loadEditData]);

  // Debug effect to log form state changes
  useEffect(() => {
    console.log('Form state updated - destinations:', formState.destinations);
  }, [formState.destinations]);

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

  // Prepare form data for API - moved before useCallback that uses it
  const prepareFormData = useCallback((
    formData: LoadsFormState,
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
  }, [distanceCalculations.allDistance, distanceCalculations.pricePerMile]);

  const handleClose = useCallback(() => {
    dispatch(resetForm());
    fileHandlers.setSelectedDocuments([]);
    onClose();
  }, [dispatch, onClose, fileHandlers]);

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

        if (editingLoad && editingLoad.id) {
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
      handleClose,
      prepareFormData,
    ]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateLoad(e);
    },
    [handleCreateLoad]
  );

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