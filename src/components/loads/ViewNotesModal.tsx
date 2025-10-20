// components/loads/ViewNotesModal.tsx
import { useEffect } from 'react';
import Modal from '@/components/ui/Modals';
import { useGetNotesQuery } from '@/redux/slices/apiSlice';
import { TComments, TLoads } from '@/types/globalTypes';
import { CiStickyNote } from 'react-icons/ci';
import { IoAdd } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';

interface ViewNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoad: TLoads | null;
  onAddNote: () => void;
}

const ViewNotesModal: React.FC<ViewNotesModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedLoad, 
  onAddNote 
}) => {
  const { 
    data: notesData, 
    isLoading: notesLoading, 
    refetch: refetchNotes 
  } = useGetNotesQuery(selectedLoad?.id || '', {
    skip: !selectedLoad?.id,
  });

  const notes = notesData?.comments || [];

  useEffect(() => {
    if (isOpen && selectedLoad) {
      refetchNotes();
    }
  }, [isOpen, selectedLoad, refetchNotes]);

  const handleClose = () => {
    onClose();
  };

  const handleAddNoteClick = () => {
    handleClose();
    onAddNote();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`All Notes - (${selectedLoad?.loadId || 'N/A'})`}
      size="md"
    >
      <div className="space-y-4 max-h-96 overflow-y-auto relative">
        {notesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : notes.length > 0 ? (
          notes.map((note: TComments, i: number) => (
            <div
              key={note._id || i}
              className="relative p-4 rounded-lg bg-slate-100 border border-slate-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Note {i + 1}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(note.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  - {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mb-3">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    note.type === 'dispatcher'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {note.type === 'dispatcher' ? 'Load Note' : 'Driver Note'}
                </span>
              </div>

              <div className="my-4 p-4 rounded-lg bg-slate-200">
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {note.text}
                </p>
              </div>

              {note.addedBy && (
                <div className="mt-3 text-center text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">
                    Added by: {note.addedBy.name}
                  </span>
                  <span className="text-slate-500 ml-2">
                    (ID: {note.addedBy.jobId})
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-300">
              <CiStickyNote size={32} className="text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              No Notes Found
            </h4>
            <p className="text-slate-500 text-sm max-w-xs">
              There are no notes for this load yet. Add the first note to
              track important information.
            </p>
            <button
              onClick={handleAddNoteClick}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <MdEdit size={16} />
              Add First Note
            </button>
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleAddNoteClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            <IoAdd size={18} />
            Add New Note
          </button>
        </div>
      )}
    </Modal>
  );
};

export default ViewNotesModal;