import React from 'react';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value?: string | number;
  description?: string;
  subRows?: (string | React.ReactNode)[];
  icon: LucideIcon;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  subRows,
  icon: Icon,
  trend,
}) => {
  return (
    <Card className="h-[140px] rounded-[14px] border border-gray-200 bg-white p-3.5 hover:-translate-y-[2px] hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <CardContent className="p-0 h-full flex flex-col justify-between">
        {/* Top Header & Value */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-gray-500 leading-tight">{title}</span>
            {value !== undefined && value !== '' && (
              <div className="text-[20px] font-semibold text-gray-900 tracking-tight leading-tight mt-0.5">
                {value}
              </div>
            )}
          </div>
          <div className="h-9 w-9 rounded-[10px] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Supporting Multi-Row Information (Zero Truncation / No `...`) */}
        <div className="space-y-0.5 text-[11px] text-gray-600 font-normal leading-tight">
          {subRows && subRows.length > 0 ? (
            subRows.map((row, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                {typeof row === 'string' ? <span>{row}</span> : row}
              </div>
            ))
          ) : (
            <>
              {description && <p className="leading-tight text-gray-500">{description}</p>}
              {trend && (
                <span className="text-[11px] font-medium text-emerald-600 block mt-0.5">
                  {trend}
                </span>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
