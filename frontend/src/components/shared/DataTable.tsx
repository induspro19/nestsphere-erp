import React from 'react';

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md">
      <table className="w-full text-sm text-left">
        <thead className="bg-accent/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider border-b border-border/40">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3.5">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-accent/30 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4">
                    {typeof col.accessorKey === 'function'
                      ? col.accessorKey(row)
                      : (row[col.accessorKey] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
