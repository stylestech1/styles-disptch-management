// components/loads/AddNoteModal.tsx
import { useState } from "react";
import Modal from "@/components/ui/Modals";
import { useAddNoteMutation, useGetLoadsQuery } from "@/redux/slices/apiSlice";
import { TLoads } from "@/types/globalTypes";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { RootState, useAppSelector } from "@/redux/store";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: TLoads;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  load,
}) => {
  const [selectedLoadIdForNote, setSelectedLoadIdForNote] = useState(
    load?.id || ""
  );
  const [addingNote, setAddingNote] = useState("");
  const [noteType, setNoteType] = useState<"dispatcher" | "driver">(
    "dispatcher"
  );

  // using useGetLoadsQuery instead of useSelector
  const { refetch } = useGetLoadsQuery({ page: 1, limit: 10 });
  const [addNote, { isLoading: addingNoteLoading }] = useAddNoteMutation();

  const theme = useAppSelector((state: RootState) => state.palette);

  const handleNotes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLoadIdForNote)
      return toast.error("Please select a load", {
        style: { background: "#dc2626", color: "#fff" },
      });

    if (!addingNote.trim())
      return toast.error("Please enter a note", {
        style: { background: "#dc2626", color: "#fff" },
      });

    try {
      await addNote({
        loadId: load.id,
        text: addingNote,
        type: noteType,
      }).unwrap();

      toast.success("Note was Added ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      await refetch();

      handleClose();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Adding note failed ❌");
    }
  };

  const handleClose = () => {
    setAddingNote("");
    setNoteType("dispatcher");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={noteType === "driver" ? "Add Driver Note" : "Add Load Note"}
      size="md"
      closeOnOutsideClick={false}
    >
      <form onSubmit={handleNotes} className="space-y-4 p-5">
        {/* Load ID */}
        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Load ID
          </Typography>
          <TextField
            aria-readonly
            value={load?.loadId || "N/A"}
            sx={{
              bgcolor: theme.currentPalette.background,
              width: "100%",
            }}
          />
        </div>

        {/* Note Type */}
        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Note Type
          </Typography>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              value={noteType}
              displayEmpty
              onChange={(e) =>
                setNoteType(e.target.value as "dispatcher" | "driver")
              }
              sx={{
                bgcolor: theme.currentPalette.background,
                width: "100%",
              }}
            >
              <MenuItem value={""} disabled>
                Select Note Type
              </MenuItem>
              <MenuItem value={"dispatcher"}>Dispatcher Note</MenuItem>
              <MenuItem value={"driver"}>Driver Note</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Note Text */}
        <div>
          <Typography
            sx={{
              color: theme.currentPalette.primary,
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              mb: 1,
            }}
          >
            Note
          </Typography>
          <TextField
            value={addingNote}
            onChange={(e) => setAddingNote(e.target.value)}
            rows={5}
            sx={{
                bgcolor: theme.currentPalette.background,
              }}
            className="block w-full px-3 py-3 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 transition-colors resize-none"
            placeholder="Enter your note here..."
            multiline
          />
        </div>

        {/* Submit */}
        <Button
          variant="contained"
          type="submit"
          disabled={addingNoteLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addingNoteLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Adding...
            </>
          ) : (
            "Add Note"
          )}
        </Button>
      </form>
    </Modal>
  );
};

export default AddNoteModal;
