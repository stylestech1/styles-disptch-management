"use client";
import Titles from "@/components/ui/Titles";
import Btns from "@/components/ui/Btns";
import Tables from "@/components/ui/Tables";

const LoadsPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Titles>All Loads</Titles>
        <Btns>Create Load</Btns>
      </div>
      <Tables style="table-auto my-10 w-full" />
    </div>
  );
};

export default LoadsPage;
