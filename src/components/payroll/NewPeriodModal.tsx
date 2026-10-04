import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { PayrollPeriod } from '../../types/payroll';
import { getMonthName } from '../../utils/formatters';

interface NewPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePeriod: (month: number, year: number, type: 'regular' | 'vacation' | 'thirteenth') => void;
  existingPeriods: PayrollPeriod[];
}

export const NewPeriodModal: React.FC<NewPeriodModalProps> = ({
  isOpen,
  onClose,
  onCreatePeriod,
  existingPeriods
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // Novembro
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [periodType, setPeriodType] = useState<'regular' | 'vacation' | 'thirteenth'>('regular');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePeriod(selectedMonth, selectedYear, periodType);
    onClose();
  };

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Abrir Novo Processamento Salarial
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Criar período para cálculo em conformidade com as regras de Angola
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            
            <div>
              <label className="block font-medium text-neutral-700">Mês de Referência</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700">Ano Fiscal</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700">Tipo de Processamento</label>
              <div className="mt-1.5 space-y-2">
                <label className="flex items-center gap-2 p-2.5 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="periodType"
                    value="regular"
                    checked={periodType === 'regular'}
                    onChange={() => setPeriodType('regular')}
                    className="text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Salário Mensal Regular</span>
                    <span className="text-[11px] text-neutral-500">Vencimento base + subsídios usuais e horas extras</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="periodType"
                    value="thirteenth"
                    checked={periodType === 'thirteenth'}
                    onChange={() => setPeriodType('thirteenth')}
                    className="text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block">13º Mês / Subsídio de Natal</span>
                    <span className="text-[11px] text-neutral-500">Gratificação natalícia (LGT Angola)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                  <input
                    type="radio"
                    name="periodType"
                    value="vacation"
                    checked={periodType === 'vacation'}
                    onChange={() => setPeriodType('vacation')}
                    className="text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 block">Subsídio de Férias</span>
                    <span className="text-[11px] text-neutral-500">Processamento autónomo de gozo de férias</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Criar Folha</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
