import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetPaletteQuery,
  useCreatePaletteMutation,
  useUpdatePaletteMutation,
  useDeletePaletteMutation,
} from "@/redux/slices/apiSlice";
import {
  setPalette,
  addCustomePalette,
  setLoadingPalette,
  setErrorPalette,
  loadPalettesFromBackend,
  removeCustomPalette as removeCustomPaletteAction,
} from "@/redux/slices/paletteSlice";
import { Palette, TPaletteConfig } from "@/types/themeType";
import {
  paletteToPaletteConfig,
  TPaletteConfigToPalette,
} from "@/utils/helperPalette";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const usePaletteManagement = () => {
  const dispatch = useDispatch();
  const { currentPalette, customPalettes } = useSelector(
    (state: RootState) => state.palette
  );
  const [localLoading, setLocalLoading] = useState(false);

  // RTK Query hooks
  const {
    data: backendPalettes = [],
    isLoading: isLoadingQuery,
    error: queryError,
    refetch: refetchPalettes,
  } = useGetPaletteQuery();

  const [createPalette, { isLoading: isCreating }] = useCreatePaletteMutation();
  const [updatePalette, { isLoading: isUpdating }] = useUpdatePaletteMutation();
  const [deletePalette, { isLoading: isDeleting }] = useDeletePaletteMutation();

  useEffect(() => {
    if (backendPalettes.length > 0) {
      dispatch(loadPalettesFromBackend(backendPalettes));

      if (
        (!currentPalette || currentPalette.customName === "Default") &&
        !customPalettes.find((p) => p.customName === currentPalette?.customName)
      ) {
        dispatch(setPalette(TPaletteConfigToPalette(backendPalettes[0])));
      }
    }
  }, [backendPalettes, dispatch]);

  // Loading Handler
  useEffect(() => {
    dispatch(
      setLoadingPalette(
        isLoadingQuery || isCreating || isUpdating || localLoading
      )
    );
  }, [isLoadingQuery, isCreating, isUpdating, localLoading, dispatch]);

  // Error Handler
  useEffect(() => {
    if (queryError) {
      const errorMessage = "Failed to load palettes from server";
      dispatch(setErrorPalette(errorMessage));
      toast.error(errorMessage);
    }
  }, [queryError, dispatch]);

  const savePaletteToBackend = async (
    palette: Palette,
    setAsCurrent: boolean = true
  ): Promise<Palette | null> => {
    setLocalLoading(true);
    try {
      const paletteConfig = paletteToPaletteConfig(palette);
      let result;

      if (palette._id) {
        result = await updatePalette({
          _id: palette._id,
          body: paletteConfig,
        }).unwrap();
      } else {
        result = await createPalette(paletteConfig).unwrap();
      }

      await refetchPalettes();
      const savedPalette = TPaletteConfigToPalette(result as TPaletteConfig);

      if (result._id && !savedPalette._id) savedPalette._id = result._id;

      dispatch(addCustomePalette(savedPalette));

      if (setAsCurrent) {
        dispatch(setPalette(savedPalette));
      }

      toast.success(
        `Palette "${savedPalette.customName}" saved successfully! 🎨`
      );
      return savedPalette;
    } catch (error) {
      console.error("Save palette error:", error);
      dispatch(setErrorPalette("Failed to save palette to server"));
      toast.error("Failed to save palette to server");
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
    } catch {
      toast.error("Failed to refresh palettes");
    }
  };

  const removeCustomPalette = async (idOrName: string) => {
    try {
      const palette = customPalettes.find(
        (p) => p._id === idOrName || p.customName === idOrName
      );
      if (palette?._id) {
        await deletePalette(palette._id).unwrap();
      }

      dispatch(removeCustomPaletteAction(idOrName));

      toast.success(`Palette "${palette?.customName}" deleted successfully!`);
    } catch (error) {
      console.error("Delete palette error:", error);
      toast.error("Failed to delete palette from server ❌");
    }
  };

  return {
    currentPalette,
    customPalettes,
    isLoading: isLoadingQuery || isCreating || isUpdating || localLoading,
    savePaletteToBackend,
    applyPalette,
    refreshPalettes,
    removeCustomPalette,
  };
};
