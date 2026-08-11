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
  if (data.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-border/40 bg-card p-8 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Mobile Card Stack View (< 768px) */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={row.id}
            className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs hover:border-primary/40 transition-colors space-y-2.5"
          >
            {columns.map((col, idx) => {
              const content =
                typeof col.accessorKey === 'function'
                  ? col.accessorKey(row)
                  : (row[col.accessorKey] as React.ReactNode);

              return (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider shrink-0 text-[10px]">
                    {col.header}
                  </span>
                  <div className="text-foreground font-medium text-right truncate">{content}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md">
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
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-accent/30 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4">
                    {typeof col.accessorKey === 'function'
                      ? col.accessorKey(row)
                      : (row[col.accessorKey] as React.ReactNode)}
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
