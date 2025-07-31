import { Target } from "lucide-react";

export default function Budget() {
  return (
    <div className="px-4 sm:px-8 py-4 lg:py-6">
      <div className="text-center py-20">
        <Target className="w-16 h-16 text-white/40 mx-auto mb-4" strokeWidth={1} />
        <h3 className="text-xl font-jakarta font-medium mb-2">Monthly Budget</h3>
        <p className="text-white/60 font-geist mb-4">Create and manage your monthly budgets</p>
        <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 font-geist text-sm">
          Create Your First Budget
        </button>
      </div>
    </div>
  );
}
