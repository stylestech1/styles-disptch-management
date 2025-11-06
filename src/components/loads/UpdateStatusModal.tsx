import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import Modal from "@/components/ui/Modals";
import { useUpdateLoadsStatusMutation } from "@/redux/slices/apiSlice";
import { TLoads, TStatusLoad } from "@/types/globalTypes";
import { IoTime, IoRefresh } from "react-icons/io5";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  load: TLoads;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  load,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TStatusLoad>(
    load?.status || "pending"
  );
  const [deliveredAt, setDeliveredAt] = useState<string>(
    load?.deliveredAt || ""
  );
  const [showDeliveredAt, setShowDeliveredAt] = useState(
    load?.status === "delivered"
  );

  const [updateLoadStatus, { isLoading: updatingStatus }] =
    useUpdateLoadsStatusMutation();

  const handleStatusChange = (e: SelectChangeEvent) => {
    const newStatus = e.target.value as TStatusLoad;
    setSelectedStatus(newStatus);
    setShowDeliveredAt(newStatus === "delivered");

    // Clear delivery date if status is not delivered
    if (newStatus !== "delivered") {
      setDeliveredAt("");
    }
  };

  const handleUpdateLoadStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate delivery date if status is delivered
    if (selectedStatus === "delivered" && !deliveredAt) {
      return toast.error("Please select delivery date and time", {
        style: { background: "#dc2626", color: "#fff" },
      });
    }

    try {
      const requestBody: { status: TStatusLoad; deliveredAt?: string } = {
        status: selectedStatus,
      };

      if (selectedStatus === "delivered" && deliveredAt) {
        requestBody.deliveredAt = deliveredAt;
      }

      await updateLoadStatus({ id: load.id, ...requestBody }).unwrap();

      toast.success("Load updated ✅", {
        style: { background: "#16a34a", color: "#fff" },
      });

      handleClose();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage || "Adding note failed ❌");
    }
  };

  const handleClose = () => {
    setSelectedStatus(load?.status || "pending");
    setDeliveredAt(load?.deliveredAt || "");
    setShowDeliveredAt(load?.status === "delivered");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Load Status"
      size="md"
      closeOnOutsideClick={false}
    >
      <form onSubmit={handleUpdateLoadStatus} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Load ID
          </label>
          <TextField
            aria-readonly
            value={load?.loadId || "N/A"}
            className="block w-full px-3 py-3 cursor-not-allowed border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <FormControl fullWidth>
            <Select
              labelId="demo-simple-select-label"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <MenuItem value={"pending"}>Pending</MenuItem>
              <MenuItem value={"in_transit"}>In Transit</MenuItem>
              <MenuItem value={"delivered"}>Delivered</MenuItem>
              <MenuItem value={"cancelled"}>Cancelled</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Delivery Date Picker - Only shown when status is delivered */}
        {showDeliveredAt && (
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <IoTime className="text-emerald-600" size={18} />
              <label className="block text-sm font-medium text-slate-700">
                Delivery Date & Time <span className="text-red-500">*</span>
              </label>
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={deliveredAt ? dayjs(deliveredAt) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    setDeliveredAt(newValue.toISOString());
                  } else {
                    setDeliveredAt("");
                  }
                }}
                disableFuture={false}
                views={["year", "month", "day", "hours", "minutes"]}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    className: "bg-white",
                    placeholder: "Select delivery date and time",
                  },
                }}
              />
            </LocalizationProvider>

            {deliveredAt && (
              <div className="text-xs text-slate-500 mt-2">
                Selected: {new Date(deliveredAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        <Button
          variant="contained"
          type="submit"
          disabled={updatingStatus}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updatingStatus ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              <IoRefresh size={18} />
              Update Status
            </>
          )}
        </Button>
      </form>
    </Modal>
  );
};

export default UpdateStatusModal;
