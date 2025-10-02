"use client";
import { BiSolidCommentError } from "react-icons/bi";

export default function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-sm my-5">
      <BiSolidCommentError size={20} className="h-4 w-4 text-red-500" />
      <span>{message}</span>
    </div>
  );
}
