import { ReactNode } from "react";

export type AlignType = "left" | "center" | "right";

export interface Column {
  key: string;
  header: string;
  align?: AlignType;
  width?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  renderRow: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  className?: string;
}

const DataTable = <T,>({
  columns,
  data,
  renderRow,
  emptyState,
  loading = false,
  className = "",
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`p-4 font-medium text-slate-600 text-${column.align || "center"}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b border-slate-200 animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key} className="p-4">
                      <div className="h-4 bg-slate-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const defaultEmptyState = (
    <tr>
      <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl mb-3">📦</div>
          <div className="text-slate-600">No records found</div>
          <div className="text-slate-400 text-sm mt-1">
            Get started by creating your first record
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`p-4 font-medium text-slate-600 text-${column.align || "center"}`}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length > 0 
              ? data.map((item, index) => renderRow(item, index))
              : (emptyState || defaultEmptyState)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;