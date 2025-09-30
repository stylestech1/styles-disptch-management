// Types
type TTable = {
  style?: string;
};

const Tables = ({ style }: TTable) => {
  return (
    <table className={style}>
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 border-r-1">
            Pickup
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Deliver
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Miles
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Price
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Load Number
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Load Status
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Driver Name
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Truck Name
          </th>
          <th scope="col" className="px-6 py-3 border-r-1">
            Trailer Name
          </th>
          <th scope="col" className="px-6 py-3">
            Pocked By
          </th>
        </tr>
      </thead>
      <tbody className="text-center">
        <tr className="border-b-1">
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4">s</td>
        </tr>
        <tr className="border-b-1">
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4">sasdasd</td>
        </tr>
        <tr className="border-b-1">
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">sasdasd</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4 border-r-1">s</td>
          <td className="px-6 py-4">s</td>
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
          <td className="px-6 py-4">s</td>
        </tr>
      </tbody>
    </table>
  );
};

export default Tables;
