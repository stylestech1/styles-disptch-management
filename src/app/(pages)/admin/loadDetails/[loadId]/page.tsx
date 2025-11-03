'use client'
import LoadInfo from "@/components/loads/LoadInfo";
import { useParams } from "next/navigation";

const LoadDetailsForAdmin = () => {
  const { loadId } = useParams();
  const loadIdParam  = Array.isArray(loadId) ? loadId[0] : loadId;
  return <LoadInfo loadId={loadIdParam} />;
};

export default LoadDetailsForAdmin;
