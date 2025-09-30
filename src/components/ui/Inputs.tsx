// types
type typeInp = "text" | "number" | "select";
type TInp = {
  disable?: boolean;
  type?: typeInp;
  placeholder?: string;
  children?: React.ReactNode
};

const Inputs = ({ disable, type, placeholder, children }: TInp) => {
  return (
    <>
      {type !== "select" ? (
        <input
          type={type}
          placeholder={placeholder}
          disabled={disable}
          className="py-2 px-5 w-full rounded-lg"
        />
      ) : (
        <select className="w-full">
          {children}
        </select>
      )}
    </>
  );
};

export default Inputs;
