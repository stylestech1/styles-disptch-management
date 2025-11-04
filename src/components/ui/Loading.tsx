"use client";
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[100vh] w-full py-10">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <h2 className="my-5 text-xl">Loading...</h2>
    </div>
  );
}
