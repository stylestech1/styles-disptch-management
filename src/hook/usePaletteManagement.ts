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
import { Palette, TPaletteConfig } from "@/types/themeType";
import { paletteToPaletteConfig, TPaletteConfigToPalette } from "@/utils/helperPalette";
import { useEffect } from "react";
import toast from "react-hot-toast";

export const usePaletteManagement = () => {
  const dispatch = useDispatch();
  const { currentPalette, customPalettes } = useSelector((state: RootState) => state.palette);

  // RTK Query hooks
  const { 
    data: backendPalettes = [], 
    isLoading: isLoadingQuery, 
    error: queryError,
    refetch: refetchPalettes 
  } = useGetPaletteQuery();

  const [createPalette, { isLoading: isCreating }] = useCreatePaletteMutation();
  const [updatePalette, { isLoading: isUpdating }] = useUpdatePaletteMutation();

  // تحميل البيانات من الـ backend عند التحميل
  useEffect(() => {
    if (backendPalettes.length > 0) {
      dispatch(loadPalettesFromBackend(backendPalettes));
    }
  }, [backendPalettes, dispatch]);

  // تحديث حالة الـ loading
  useEffect(() => {
    dispatch(setLoadingPalette(isLoadingQuery || isCreating || isUpdating));
  }, [isLoadingQuery, isCreating, isUpdating, dispatch]);

  // معالجة الأخطاء
  useEffect(() => {
    if (queryError) {
      const errorMessage = "Failed to load palettes from server";
      dispatch(setErrorPalette(errorMessage));
      toast.error(errorMessage);
    }
  }, [queryError, dispatch]);

  // حفظ الـ palette إلى الـ backend
  const savePaletteToBackend = async (palette: Palette): Promise<Palette | null> => {
    try {
      const paletteConfig = paletteToPaletteConfig(palette);
      let result;

      if (palette._id) {
        // Update existing palette
        result = await updatePalette(paletteConfig).unwrap();
      } else {
        // Create new palette
        result = await createPalette(paletteConfig).unwrap();
      }

      const savedPalette = TPaletteConfigToPalette(result);
      dispatch(addCustomePalette(savedPalette));
      dispatch(setPalette(savedPalette));
      
      return savedPalette;
    } catch (error) {
      const errorMessage = "Failed to save palette to server";
      dispatch(setErrorPalette(errorMessage));
      toast.error(errorMessage);
      return null;
    }
  };

  // تطبيق palette
  const applyPalette = (palette: Palette) => {
    dispatch(setPalette(palette));
    toast.success(`Applied ${palette.customName} palette! 🎨`);
  };

  // إعادة تحميل البيانات من الـ backend
  const refreshPalettes = () => {
    refetchPalettes();
  };

  return {
    currentPalette,
    customPalettes,
    isLoading: isLoadingQuery || isCreating || isUpdating,
    savePaletteToBackend,
    applyPalette,
    refreshPalettes,
  };
};