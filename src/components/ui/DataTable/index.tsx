import React from 'react';
import { cn } from '../../../lib/utils';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

export function DataTable<T>({ data, columns, className }: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto border rounded-md border-gray-200 dark:border-gray-800", className)}>
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b bg-gray-50 dark:bg-gray-800/50 dark:border-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center align-middle text-gray-500"
              >
                No results.
              </td>
            </tr>
          ) : (
            data.map((item, i) => (
              <tr
                key={i}
                className="border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-4 align-middle">
                    {col.cell ? col.cell(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
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
