'use client'

// Types
type TBtns = {
  children: React.ReactNode;
  style?: string;
  action?: () => void;
  type?: "submit" | "button";
};

const Btns = ({ children, style, action, type }: TBtns) => {
  return (
    <button
      type={type}
      className={`${style} py-2 px-5 rounded-lg text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer`}
      onClick={() => action}
    >
      {children}
    </button>
  );
};

export default Btns;
