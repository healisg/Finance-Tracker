import { ReactNode } from "react";

interface AnimatedMetricCardProps {
  title: string;
  value: string;
  change: string;
  changeColor: string;
  icon: ReactNode;
  gradientClass: string;
  children?: ReactNode;
}

export default function AnimatedMetricCard({
  title,
  value,
  change,
  changeColor,
  icon,
  gradientClass,
  children
}: AnimatedMetricCardProps) {
  return (
    <div className={`metric-card ${gradientClass} group`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-white/60 flex items-center gap-1 font-geist">
            {icon}
            {title}
          </p>
          <span className={`text-xs font-geist shimmer ${changeColor}`}>
            {change}
          </span>
        </div>
        <div className="text-2xl mb-6 font-jakarta font-medium transition-all duration-300 group-hover:scale-105">
          {value}
        </div>
        <div className="flex items-center justify-between text-xs">
          <button className="underline underline-offset-2 font-geist hover:text-white/80 transition-colors">
            View Details
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}