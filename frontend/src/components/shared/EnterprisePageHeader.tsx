import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface EnterpriseHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  className?: string;
}

export interface EnterprisePageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: EnterpriseHeaderAction[] | ReactNode;
}

export const EnterprisePageHeader: React.FC<EnterprisePageHeaderProps> = ({
  icon: Icon,
  title,
  description,
  actions,
}) => {
  return (
    <div className="p-6 md:p-7 rounded-2xl border border-border/40 bg-gradient-to-r from-card via-card/95 to-accent/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
      {/* Left Section (70% width allocation on desktop) */}
      <div className="flex-1 space-y-1.5 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pl-14">
          {description}
        </p>
      </div>

      {/* Right Section (30% width allocation on desktop, single horizontal row) */}
      {actions && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
          {Array.isArray(actions)
            ? actions.map((action, idx) => {
                const ActionIcon = action.icon;
                const isPrimary = action.variant === 'default' || (!action.variant && idx === 0);
                return (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`h-12 min-w-[180px] px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap ${
                      isPrimary
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-card text-foreground border border-border/60 hover:bg-accent/60 hover:border-primary/40'
                    } ${action.className || ''}`}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0" />}
                    <span>{action.label}</span>
                  </button>
                );
              })
            : actions}
        </div>
      )}
    </div>
  );
};
