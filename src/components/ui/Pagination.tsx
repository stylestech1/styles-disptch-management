"use client";
interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    total?: number;
  } | null;
  page: number;
  setPage: (page: number) => void;
  pageSize?: number;
  showInfo?: boolean;
  variant?: "default" | "minimal";
}

const Pagination = ({
  pagination,
  page,
  setPage,
  variant = "default",
}: PaginationProps) => {
  if (!pagination) return null;

  const { currentPage, totalPages } = pagination;

  if (variant === "minimal") {
    return (
      <div className="flex justify-end items-center mt-6">
        <div className="flex items-center justify-end gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>

          <span className="px-3 py-2 text-sm text-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end items-center mt-6">
      <div className="flex items-center justify-end gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(Math.max(1, page - 1))}
          className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="px-3 py-2 text-sm text-slate-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
