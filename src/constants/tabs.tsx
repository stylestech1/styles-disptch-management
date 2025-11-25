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
  subtitle: string;
  icon?: React.ReactNode;
};

export const TABS_CONFIG: Record<TUserRole, TabItem[]> = {
  admin: [
    {
      label: "Loads",
      subtitle:
        "Manage and track all your shipments and deliveries in one place.",
      icon: <FaCirclePlus />,
    },
    {
      label: "Users",
      subtitle: "Manage your dispatch team members and their access",
      icon: <IoPeopleOutline />,
    },
    {
      label: "Drivers",
      subtitle: "Manage your driver team members and their access",
      icon: <PiUsersFill />,
    },
    {
      label: "Trucks",
      subtitle: "Manage your trucks and their access",
      icon: <FaTruckFast />,
    },
    {
      label: "Truck Dashboard",
      subtitle: "View detailed revenue metrics per truck to track earnings. Identify high-performing vehicles and monitor overall fleet performance.",
      icon: <SiGoogleanalytics />,
    },
    {
      label: "Calculation",
      subtitle:
        "Calculate rates and plan your routes with real-time distance measurements",
      icon: <ImCalculator />,
    },
    {
      label: "Broker",
      subtitle: "Manage your broker team members and their access",
      icon: <MdOutlineCommentBank />,
    },
    {
      label: "Customers",
      subtitle: "Handle your customers with love",
      icon: <RiCustomerService2Fill />,
    },
    {
      label: "Truck Summary",
      subtitle: "Detailed overview of truck information and performance.",
    },
    {
      label: "Load Details",
      subtitle: "Manage and track all your shipments and deliveries in one place.",
    },
  ],
  employee: [
    {
      label: "Loads",
      subtitle: "Manage your dispatch team members and their access",
      icon: <FaCirclePlus />,
    },
    {
      label: "Calculation",
      subtitle: "Manage your driver team members and their access",
      icon: <ImCalculator />,
    },
    {
      label: "Customers",
      subtitle: "Manage your trucks and their access",
      icon: <RiCustomerService2Fill />,
    },
    {
      label: "Load Details",
      subtitle: "Manage and track all your shipments and deliveries in one place.",
    },
  ],
  driver: [
    {
      label: "Loads",
      subtitle: "Manage your dispatch team members and their access",
      icon: <FaCirclePlus />,
    },
  ],
};
