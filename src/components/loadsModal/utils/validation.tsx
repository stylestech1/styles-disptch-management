import { LoadFormState } from "@/types/loadsTyles";

export const validateLoadForm = (formData: LoadFormState, isEditing: boolean): string[] => {
  const errors: string[] = [];

  // Tab 1 validations
  if (!formData.origin) {
    errors.push("Please select origin");
  }

  if (formData.destinations.length === 0 || formData.destinations.some((d) => !d)) {
    errors.push("Please select at least one destination");
  }

  // Tab 2 validations
  if (!formData.price || Number(formData.price) <= 0) {
    errors.push("Please enter a valid total price");
  }

  if (!formData.loadIDInp.trim()) {
    errors.push("Load ID is required");
  }

  if (!formData.pickupAt) {
    errors.push("Pickup date is required");
  }

  if (!formData.completedAt) {
    errors.push("Delivery date is required");
  }

  // Tab 3 validations (for new loads only)
  if (!isEditing) {
    if (!formData.driverId) {
      errors.push("Please select driver");
    }

    if (!formData.truckType) {
      errors.push("Please select truck type");
    }

    if (!formData.truckId) {
      errors.push("Please select truck");
    }
  }

  return errors;
};

export const validateFiles = (files: File[]): string | null => {
  if (files.length > 2) {
    return "You can only upload maximum 2 files";
  }

  const invalidFiles = files.filter((file) => {
    const fileExtension = file.name.toLowerCase().split(".").pop();
    return fileExtension !== "pdf" && file.type !== "application/pdf";
  });

  if (invalidFiles.length > 0) {
    return "Only PDF files are allowed";
  }

  return null;
};