import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[140px] rounded-[14px] border border-gray-200/80 bg-white p-4 animate-pulse space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-gray-200/80 rounded-md"></div>
            <div className="h-9 w-9 bg-gray-200/80 rounded-[10px]"></div>
          </div>
          <div className="h-7 w-20 bg-gray-200/80 rounded-md"></div>
          <div className="h-3 w-36 bg-gray-100 rounded-md"></div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="rounded-[14px] border border-gray-200 bg-white p-4 animate-pulse space-y-3">
      <div className="h-10 bg-gray-100 rounded-[10px] w-full"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-11 bg-gray-50 border border-gray-100 rounded-[8px] w-full flex items-center justify-between px-4">
            <div className="h-4 w-1/4 bg-gray-200/70 rounded-md"></div>
            <div className="h-4 w-1/6 bg-gray-200/70 rounded-md"></div>
            <div className="h-4 w-1/5 bg-gray-200/70 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 max-w-[1600px] mx-auto animate-pulse">
      <div className="h-12 bg-gray-200/80 rounded-[12px] w-full"></div>
      <CardSkeleton count={4} />
      <TableSkeleton rows={4} />
    </div>
  );
};
