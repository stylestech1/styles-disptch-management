// components/loads/AddNoteModal.tsx
import { useState } from "react";
import Modal from "@/components/ui/Modals";
import { useAddNoteMutation, useGetLoadsQuery } from "@/redux/slices/apiSlice";
import { TLoads } from "@/types/globalTypes";
import { MdEdit } from "react-icons/md";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose }) => {
  const [selectedLoadIdForNote, setSelectedLoadIdForNote] = useState("");
  const [addingNote, setAddingNote] = useState("");
  const [noteType, setNoteType] = useState<"dispatcher" | "driver">(
    "dispatcher"
  );

  // استخدام useGetLoadsQuery بدلاً من useSelector
  const { data: loadsData } = useGetLoadsQuery({ page: 1, limit: 1000 }); // جلب كل ال loads
  const [addNote, { isLoading: addingNoteLoading }] = useAddNoteMutation();

  const loads = loadsData?.data || [];

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
        loadId: selectedLoadIdForNote,
        text: addingNote,
        type: noteType,
      }).unwrap();

      toast.success("Note was Added ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      handleClose();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Adding note failed ❌");
    }
  };

  const handleClose = () => {
    setSelectedLoadIdForNote("");
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
    >
      <form onSubmit={handleNotes} className="space-y-4">
        {/* Load ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Load ID
          </label>
          <select
            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
            value={selectedLoadIdForNote}
            onChange={(e) => setSelectedLoadIdForNote(e.target.value)}
            required
          >
            <option value="">Select Load</option>
            {loads.map((l: TLoads) => (
              <option key={l.id} value={l.id}>
                {l.loadId}
              </option>
            ))}
          </select>
        </div>

        {/* Note Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note Type
          </label>
          <select
            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer"
            value={noteType}
            onChange={(e) =>
              setNoteType(e.target.value as "dispatcher" | "driver")
            }
            required
          >
            <option value="dispatcher">Load Note</option>
            <option value="driver">Driver Note</option>
          </select>
        </div>

        {/* Note Text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note
          </label>
          <textarea
            value={addingNote}
            onChange={(e) => setAddingNote(e.target.value)}
            cols={30}
            rows={5}
            className="block w-full px-3 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
            placeholder="Enter your note here..."
            required
          ></textarea>
        </div>

        {/* Submit */}
        <button
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
        </button>
      </form>
    </Modal>
  );
};

export default AddNoteModal;
