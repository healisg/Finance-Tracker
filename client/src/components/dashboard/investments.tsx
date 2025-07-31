import { BarChart3 } from "lucide-react";

export default function Investments() {
  return (
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" strokeWidth={1} />
        <h3 className="text-xl font-jakarta font-medium mb-2">Investment Portfolio</h3>
        <p className="text-white/60 font-geist mb-4">Monitor your investment performance</p>
        <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-geist text-sm">
          Add Your First Investment
        </button>
      </div>
    </div>
  );
}
