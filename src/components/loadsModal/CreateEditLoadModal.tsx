import { Suspense } from "react";
import Modal from "../ui/Modals";
import { CreateEditLoadModalProps } from "@/types/globalTypes";
import LoadForm from "./forms/LoadForm"

const CreateEditLoadModal: React.FC<CreateEditLoadModalProps> = ({
  isOpen,
  onClose,
  editingLoad = null,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingLoad ? `Edit Load - ${editingLoad.loadId}` : "Create New Load"
      }
      size="xl"
      closeOnOutsideClick={false}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <LoadForm editingLoad={editingLoad} onClose={onClose} />
      </Suspense>
    </Modal>
  );
};

export default CreateEditLoadModal
