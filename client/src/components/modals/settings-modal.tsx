import { useState, useEffect } from "react";
import { X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type Currency = 'USD' | 'GBP';

export interface CurrencySettings {
  currency: Currency;
  symbol: string;
  code: string;
}

export const CURRENCIES: Record<Currency, CurrencySettings> = {
  USD: { currency: 'USD', symbol: '$', code: 'USD' },
  GBP: { currency: 'GBP', symbol: '£', code: 'GBP' }
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('GBP');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved currency from localStorage, default to GBP
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'GBP')) {
      setSelectedCurrency(savedCurrency);
    } else {
      setSelectedCurrency('GBP');
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('currency', selectedCurrency);
    // Dispatch custom event to notify other components of currency change
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: selectedCurrency }));
    toast({
      title: "Settings saved",
      description: `Currency updated to ${CURRENCIES[selectedCurrency].code}`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="sidebar-gradient-bg rounded-xl w-full max-w-md border border-white/10">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" strokeWidth={1.5} />
              <h2 className="text-xl font-jakarta font-semibold">Settings</h2>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium font-geist">Currency</label>
              <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar (USD) - $</SelectItem>
                  <SelectItem value="GBP">British Pound (GBP) - £</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-white/60 font-geist">
                This will change how all amounts are displayed throughout the app.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 hover:bg-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}