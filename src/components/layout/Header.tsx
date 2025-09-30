import React from 'react'

const Header = () => {
  return (
    <nav className="bg-white shadow-md px-10 py-3 flex justify-between items-center">
  <div className="flex items-center space-x-2">
    <img src="/truck.png" alt="Logo" className="h-8 w-8" />
    <span className="text-xl font-bold text-indigo-600">Styles Dispatch</span>
  </div>

  <button
    className="bg-red-500 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition"
  >
    Logout
  </button>
</nav>

  );
};




export default Header;