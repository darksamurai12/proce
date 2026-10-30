import React from 'react';
import { 
  Building2, 
  Calculator, 
  Database,
  FileSpreadsheet, 
  FileText, 
  Layers, 
  LogIn,
  LogOut,
  Plus, 
  Settings, 
  Users 
} from 'lucide-react';
import { User } from 'firebase/auth';

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
  activePeriodLabel?: string;
  onNewPayrollModal: () => void;
  currentUser: { email?: string | null; displayName?: string | null } | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isDbSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activePeriodLabel,
  onNewPayrollModal,
  currentUser,
  onSignIn,
  onSignOut,
  isDbSyncing
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
          
          {/* Zone 1: Wordmark / Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left group flex items-center focus:outline-none py-1"
            >
              <img
                src="/assets/aistudio/logo_2_4756bbe5.png"
                alt="We Business Consulting"
                className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
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

          {/* Zone 3: Actions + DB Sync / Auth Indicator */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 rounded-md text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Firestore Conectado"></span>
                <span className="text-neutral-700 font-medium truncate max-w-[130px]" title={currentUser.email || ''}>
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={onSignOut}
                  className="text-neutral-400 hover:text-red-600 transition-colors ml-1 p-0.5"
                  title="Terminar Sessão"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors border border-neutral-300"
                title="Aceder à tela de autenticação"
              >
                <LogIn className="w-3.5 h-3.5 text-neutral-600" />
                <span>Iniciar Sessão</span>
              </button>
            )}

            <button
              onClick={onNewPayrollModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-sm"
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
