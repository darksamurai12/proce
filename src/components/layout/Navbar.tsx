import React from 'react';
import { 
  Building2, 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  Layers, 
  Plus, 
  Settings, 
  Users 
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'payroll'
  | 'employees'
  | 'payslip'
  | 'reports'
  | 'calculator'
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activePeriodLabel: string;
  onNewPayrollModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activePeriodLabel,
  onNewPayrollModal
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Painel', icon: <Layers className="w-4 h-4" /> },
    { id: 'payroll', label: 'Folha Salarial', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'employees', label: 'Colaboradores', icon: <Users className="w-4 h-4" /> },
    { id: 'payslip', label: 'Recibos', icon: <FileText className="w-4 h-4" /> },
    { id: 'reports', label: 'Mapas Legais', icon: <Building2 className="w-4 h-4" /> },
    { id: 'calculator', label: 'Simulador IRT', icon: <Calculator className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark (Frontend Design Constitution Top Bar Contract) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
                Kz
              </div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">
                KwanzaFolha Angola
              </span>
            </button>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-neutral-700">{activePeriodLabel}</span>
            </div>

            <button
              onClick={onNewPayrollModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Processamento</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-neutral-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md shrink-0 transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 bg-neutral-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
