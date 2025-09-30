import Titles from "./Titles";
import Labels from "./Labels";
import Inputs from "./Inputs";
import Btns from "./Btns";

const Modals = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="container mx-auto p-10 bg-white border border-gray-400 rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Titles>{children}</Titles>

      <form className="my-5 grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-3">
          <Labels>Pick Up</Labels>
          <Inputs type="select">
            <option>New York, USA</option>
            <option>Sedni, USA</option>
            <option>Calefornia, USA</option>
          </Inputs>
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Deliver To</Labels>
          <Inputs type="select">
            <option value={"newYork"}>New York, USA</option>
            <option value={"sedni"}>Sedni, USA</option>
            <option value={"celfornia"}>Calefornia, USA</option>
          </Inputs>
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Miles</Labels>
          <Inputs type="text" disable={true} />
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Price</Labels>
          <Inputs type="number" placeholder="Price $" disable={false} />
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Load Number</Labels>
          <Inputs type="number" disable={true} />
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Load Status</Labels>
          <Inputs type="select">
            <option value={"pickedUp"}>Picked Up</option>
            <option value={"in-transit"}>In-Transit</option>
            <option value={"delivered"}>Delivered</option>
            <option value={"paid"}>Paid</option>
          </Inputs>
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Driver Name</Labels>
          <Inputs type="text" placeholder="Driver Name" disable={false} />
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Truck Name</Labels>
          <Inputs type="text" placeholder="Truck Name" disable={false} />
        </div>

        <div className="flex flex-col gap-3">
          <Labels>Price</Labels>
          <Inputs type="select">
            <option value={"disName1"}>Dispatcher Name 1</option>
            <option value={"disName2"}>Dispatcher Name 2</option>
            <option value={"disName3"}>Dispatcher Name 3</option>
          </Inputs>
        </div>

        <Btns style="!bg-green-700 hover:!bg-green-800" type="submit">
          Create
        </Btns>
      </form>
    </section>
  );
};

export default Modals;
