import { ReactNode } from "react";

interface AnimatedForecastCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  colorClass: string;
}

export default function AnimatedForecastCard({
  title,
  value,
  icon,
  colorClass
}: AnimatedForecastCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105 hover:bg-white/10 hover:border-white/20 group">
      <div className="flex items-center gap-2 mb-2">
        <div className="transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <span className="text-sm text-white/60 font-geist group-hover:text-white/80 transition-colors">
          {title}
        </span>
      </div>
      <div className={`text-xl font-medium font-jakarta transition-all duration-300 group-hover:scale-105 ${colorClass}`}>
        {value}
      </div>
      {/* Subtle pulsing indicator */}
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/20 opacity-50 group-hover:opacity-100 transition-opacity pulse"></div>
    </div>
  );
}