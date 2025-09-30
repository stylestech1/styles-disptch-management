// Importing Components
import Btns from "@/components/ui/Btns";
import Tables from "@/components/ui/Tables";
import Taps from "@/components/ui/Taps";
import Titles from "@/components/ui/Titles";
import Link from "next/link";

const AdminDashboard = () => {
  return (
    <section className="mx-auto grid grid-cols-10">
      <Taps style={"col-span-1"}>
        <ul className="flex flex-col">
          <li className="hover:bg-gray-300 py-5 cursor-pointer text-center border-b-1">
            <Link href={"/loads"}>Loads</Link>
          </li>
          <li className="hover:bg-gray-300 py-5 cursor-pointer text-center border-b-1">
            <Link href={"/drivers"}>Drivers</Link>
          </li>
          <li className="hover:bg-gray-300 py-5 cursor-pointer text-center border-b-1">
            <Link href={"/dispatcher"}>Dispatcher</Link>
          </li>
          <li className="hover:bg-gray-300 py-5 cursor-pointer text-center border-b-1">
            <Link href={"/trucks"}>Trucks</Link>
          </li>
          <li className="hover:bg-gray-300 py-5 cursor-pointer text-center">
            <Link href={"/trailers"}>Trailers</Link>
          </li>
        </ul>
      </Taps>

      <div className="col-span-9">
        <div className="flex items-center justify-between">
          <Titles>User name</Titles>
          <Btns>Create Load</Btns>
        </div>
        <Tables style="table-auto my-20 w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 border-r-1">Pickup</th>
              <th scope="col" className="px-6 py-3 border-r-1">Deliver</th>
              <th scope="col" className="px-6 py-3 border-r-1">Miles</th>
              <th scope="col" className="px-6 py-3 border-r-1">Price</th>
              <th scope="col" className="px-6 py-3 border-r-1">Load Number</th>
              <th scope="col" className="px-6 py-3 border-r-1">Load Status</th>
              <th scope="col" className="px-6 py-3 border-r-1">Driver Name</th>
              <th scope="col" className="px-6 py-3 border-r-1">Truck Name</th>
              <th scope="col" className="px-6 py-3 border-r-1">Trailer Name</th>
              <th scope="col" className="px-6 py-3 border-r-1">Pocked By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
            </tr>
            <tr>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">sasdasd</td>
            </tr>
            <tr>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">sasdasd</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
            </tr>
            <tr>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">sasdasd</td>
              <td className="px-6 py-4 border-r-1">s</td>
              <td className="px-6 py-4 border-r-1">s</td>
            </tr>

          </tbody>
        </Tables>
      </div>
    </section>
  );
};

export default AdminDashboard;
