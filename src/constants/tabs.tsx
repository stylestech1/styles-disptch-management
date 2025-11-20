import { FaCirclePlus, FaTruckFast } from "react-icons/fa6";
import { PiUsersFill } from "react-icons/pi";
import { ImCalculator } from "react-icons/im";
import { IoPeopleOutline } from "react-icons/io5";
import { RiCustomerService2Fill } from "react-icons/ri";
import { SiGoogleanalytics } from "react-icons/si";
import { MdOutlineCommentBank } from "react-icons/md";
import { TUserRole } from "@/types/globalTypes";

type TabItem = {
  label: string;
  icon: React.ReactNode;
};

export const TABS_CONFIG: Record<TUserRole, TabItem[]> = {
  admin: [
    { label: "Loads", icon: <FaCirclePlus /> },
    { label: "Users", icon: <IoPeopleOutline /> },
    { label: "Drivers", icon: <PiUsersFill /> },
    { label: "Trucks", icon: <FaTruckFast /> },
    { label: "Truck Dashboard", icon: <SiGoogleanalytics /> },
    { label: "Calculation", icon: <ImCalculator /> },
    { label: "Broker", icon: <MdOutlineCommentBank /> },
    { label: "Customers", icon: <RiCustomerService2Fill /> },
  ],
  employee: [
    { label: "Loads", icon: <FaCirclePlus /> },
    { label: "Calculation", icon: <ImCalculator /> },
    { label: "Customers", icon: <RiCustomerService2Fill /> },
  ],
  driver: [{ label: "Loads", icon: <FaCirclePlus /> }],
};
