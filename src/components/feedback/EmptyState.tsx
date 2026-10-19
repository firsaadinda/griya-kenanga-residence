import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`w-full rounded-[28px] bg-white border border-[#E8EAEC] p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-[0_8px_30px_rgba(38,41,46,0.02)] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] flex items-center justify-center text-[#737A84] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#26292E] mb-1">{title}</h3>
      <p className="text-xs text-[#737A84] max-w-md leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
