import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { 
  useGetPaletteQuery, 
  useCreatePaletteMutation, 
  useUpdatePaletteMutation 
} from "@/redux/slices/apiSlice";
import { 
  setPalette, 
  addCustomePalette, 
  setLoadingPalette, 
  setErrorPalette,
  loadPalettesFromBackend 
} from "@/redux/slices/paletteSlice";
import { Palette } from "@/types/themeType";
import { paletteToPaletteConfig, TPaletteConfigToPalette } from "@/utils/helperPalette";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const usePaletteManagement = () => {
  const dispatch = useDispatch();
  const { currentPalette, customPalettes } = useSelector((state: RootState) => state.palette);
  const [localLoading, setLocalLoading] = useState(false);

  // RTK Query hooks
  const { 
    data: backendPalettes = [], 
    isLoading: isLoadingQuery, 
    error: queryError,
    refetch: refetchPalettes 
  } = useGetPaletteQuery();

  const [createPalette, { isLoading: isCreating }] = useCreatePaletteMutation();
  const [updatePalette, { isLoading: isUpdating }] = useUpdatePaletteMutation();

  useEffect(() => {
    if (backendPalettes.length > 0) {
      dispatch(loadPalettesFromBackend(backendPalettes));
    }
  }, [backendPalettes, dispatch]);

  // Loading Handler
  useEffect(() => {
    dispatch(setLoadingPalette(isLoadingQuery || isCreating || isUpdating || localLoading));
  }, [isLoadingQuery, isCreating, isUpdating, localLoading, dispatch]);

  // Error Handler
  useEffect(() => {
    if (queryError) {
      const errorMessage = "Failed to load palettes from server";
      dispatch(setErrorPalette(errorMessage));
      toast.error(errorMessage);
    }
  }, [queryError, dispatch]);

  const savePaletteToBackend = async (palette: Palette): Promise<Palette | null> => {
    setLocalLoading(true);
    try {
      const paletteConfig = paletteToPaletteConfig(palette);
      let result;

      if (palette._id) {
        result = await updatePalette({
          _id: palette._id,
          body: paletteConfig
        }).unwrap();
      } else {
        result = await createPalette(paletteConfig).unwrap();
      }

      const savedPalette = TPaletteConfigToPalette(result);
      
      dispatch(addCustomePalette(savedPalette));
      dispatch(setPalette(savedPalette));
      
      toast.success(`Palette "${savedPalette.customName}" saved successfully! 🎨`);
      return savedPalette;
    } catch (error) {
      console.error('Save palette error:', error);
      const errorMessage = "Failed to save palette to server";
      dispatch(setErrorPalette(errorMessage));
      toast.error(errorMessage);
      return null;
    } finally {
      setLocalLoading(false);
    }
  };

  const applyPalette = (palette: Palette) => {
    dispatch(setPalette(palette));
    toast.success(`Applied "${palette.customName}" palette! 🎨`);
  };

  const refreshPalettes = async () => {
    try {
      await refetchPalettes().unwrap();
      toast.success("Palettes refreshed successfully! 🔄");
    } catch{
      toast.error("Failed to refresh palettes");
    }
  };

  return {
    currentPalette,
    customPalettes,
    isLoading: isLoadingQuery || isCreating || isUpdating || localLoading,
    savePaletteToBackend,
    applyPalette,
    refreshPalettes,
  };
};