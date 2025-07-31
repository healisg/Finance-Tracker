import { Search, Bell, Settings } from "lucide-react";
import { useState } from "react";
import SettingsModal from "@/components/modals/settings-modal";

interface TopBarProps {
  title: string;
  subtitle: string;
  onAddTransaction: () => void;
}

export default function TopBar({ title, subtitle, onAddTransaction }: TopBarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-8 py-4 lg:py-6 border-b border-white/10 gap-4 flex-shrink-0">
      <div>
        <h1 className="text-2xl font-jakarta font-medium">{title}</h1>
        <p className="text-xs text-white/60 font-geist">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10">
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </button>
        
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10">
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
          title="Settings"
        >
          <Settings className="w-5 h-5" strokeWidth={1.5} />
        </button>
        
        <button 
          onClick={onAddTransaction}
          className="px-4 py-2 rounded-full bg-white text-sm font-medium text-black hover:bg-gray-200 font-geist"
        >
          Add Transaction
        </button>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
