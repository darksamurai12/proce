import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Calculator, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  Percent, 
  ShieldCheck, 
  Wallet 
} from 'lucide-react';
import { ANGOLA_IRT_TIERS, simulateGrossToNet } from '../../utils/angolaPayrollCalculator';
import { formatKz, formatPercent } from '../../utils/formatters';

export const SalaryCalculatorView: React.FC = () => {
  const [baseSalary, setBaseSalary] = useState<number>(350000);
  const [foodAllowance, setFoodAllowance] = useState<number>(30000);
  const [transportAllowance, setTransportAllowance] = useState<number>(30000);
  const [roleAllowance, setRoleAllowance] = useState<number>(50000);
  const [bonus, setBonus] = useState<number>(0);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);

  const result = useMemo(() => {
    return simulateGrossToNet({
      baseSalary,
      foodAllowance,
      transportAllowance,
      roleAllowance,
      bonus,
      overtimeHours
    });
  }, [baseSalary, foodAllowance, transportAllowance, roleAllowance, bonus, overtimeHours]);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Simulador Oficial de Salário Líquido, IRT e INSS
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Baseado na Lei n.º 28/20 (Código do IRT de Angola) e no Regime da Segurança Social (INSS Angola)
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-5">
          <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-neutral-700" />
            <span>Dados da Remuneração (Kz)</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-900">
                Salário Base Mensal (Kz) *
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={baseSalary || ''}
                onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 text-base font-bold font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                placeholder="Ex: 350000"
              />
              <span className="text-[11px] text-neutral-400">
                Salário acordado no contrato de trabalho
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Subsídio de Alimentação (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={foodAllowance || ''}
                onChange={(e) => setFoodAllowance(Number(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-emerald-600">
                Isento até 30.000 Kz por mês
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Subsídio de Transporte (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={transportAllowance || ''}
                onChange={(e) => setTransportAllowance(Number(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-emerald-600">
                Isento até 30.000 Kz por mês
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Subsídio de Função / Chefia (Kz)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={roleAllowance || ''}
                onChange={(e) => setRoleAllowance(Number(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <span className="text-[11px] text-neutral-400">
                Tributável integralmente em INSS e IRT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Horas Extras (50%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overtimeHours || ''}
                  onChange={(e) => setOvertimeHours(Number(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700">
                  Bónus / Prémio (Kz)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={bonus || ''}
                  onChange={(e) => setBonus(Number(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[11px] text-neutral-500 block mb-1.5">Exemplos rápidos de salários em Angola:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBaseSalary(85000);
                    setFoodAllowance(25000);
                    setTransportAllowance(25000);
                    setRoleAllowance(0);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                >
                  85.000 Kz (Isento IRT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBaseSalary(180000);
                    setFoodAllowance(30000);
                    setTransportAllowance(30000);
                    setRoleAllowance(0);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                >
                  180.000 Kz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBaseSalary(500000);
                    setFoodAllowance(30000);
                    setTransportAllowance(30000);
                    setRoleAllowance(50000);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                >
                  500.000 Kz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBaseSalary(1500000);
                    setFoodAllowance(45000);
                    setTransportAllowance(45000);
                    setRoleAllowance(200000);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-700 transition-colors"
                >
                  1.500.000 Kz
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Calculation Engine */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Big Result Card */}
          <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Salário Líquido Mensal Estimado
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-neutral-900 mt-1">
                  {formatKz(result.netSalary)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Total Ilíquido (Bruto):</span>
                <span className="text-lg font-bold font-mono text-neutral-800">{formatKz(result.grossSalary)}</span>
              </div>
            </div>

            {/* Step by step educational formula */}
            <div className="space-y-4 text-xs">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-1.5 text-sm">
                <Info className="w-4 h-4 text-neutral-600" />
                <span>Demonstração Passo a Passo do Cálculo Fiscal</span>
              </h3>

              {/* Step 1: Isenções */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Passo 1: Isenções Legais Aplicadas</span>
                  <span className="font-mono text-emerald-700">{formatKz(result.totalExemptions)}</span>
                </div>
                <div className="text-neutral-600 text-[11px]">
                  Alimentação isenta: {formatKz(result.exemptFoodAllowance, false)} (limite legal 30.000 Kz) · Transporte isento: {formatKz(result.exemptTransportAllowance, false)} (limite legal 30.000 Kz)
                </div>
              </div>

              {/* Step 2: INSS */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Passo 2: Segurança Social (INSS Angola - 3%)</span>
                  </span>
                  <span className="font-mono text-blue-800">-{formatKz(result.inssEmployeeAmount)}</span>
                </div>
                <div className="text-neutral-600 text-[11px]">
                  Base Sujeita a INSS: {formatKz(result.inssSubjectBase, false)} × 3% = <strong>{formatKz(result.inssEmployeeAmount)}</strong> (Encargo da empresa: 8% = {formatKz(result.inssEmployerAmount)})
                </div>
              </div>

              {/* Step 3: Matéria Colectável IRT */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-amber-700" />
                    <span>Passo 3: Matéria Colectável de IRT</span>
                  </span>
                  <span className="font-mono font-bold text-amber-900">{formatKz(result.irtTaxableBase)}</span>
                </div>
                <div className="text-neutral-600 text-[11px]">
                  Fórmula: Rendimento Bruto ({formatKz(result.grossSalary, false)}) - INSS 3% ({formatKz(result.inssEmployeeAmount, false)}) - Isenções Legais ({formatKz(result.totalExemptions, false)}) = <strong>{formatKz(result.irtTaxableBase)}</strong>
                </div>
              </div>

              {/* Step 4: IRT Aplicado */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1.5">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Passo 4: Retenção na Fonte de IRT (Grupo A)</span>
                  <span className="font-mono text-amber-800">-{formatKz(result.irtAmount)}</span>
                </div>
                <div className="text-neutral-600 text-[11px]">
                  <strong>Escalão aplicado:</strong> {result.irtTierApplied.description}
                </div>
                {result.irtAmount > 0 && (
                  <div className="text-neutral-600 text-[11px]">
                    Parcela Fixa: {formatKz(result.irtFixedParcel, false)} + ({formatPercent(result.irtExcessRate)} sobre o excesso de {formatKz(result.irtTierApplied.min - 1, false)}) = <strong>{formatKz(result.irtAmount)}</strong>
                  </div>
                )}
                {result.irtAmount === 0 && (
                  <div className="text-emerald-700 text-[11px] font-medium">
                    ✓ Isento de IRT por estar dentro do escalão até 100.000 Kz de Matéria Colectável.
                  </div>
                )}
              </div>

              {/* Step 5: Custo Global da Empresa */}
              <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-between text-[11px]">
                <span className="text-neutral-600">
                  Custo Total para a Entidade Empregadora (Bruto + 8% INSS Patronal + 1.5% Seguro):
                </span>
                <span className="font-mono font-bold text-neutral-900">{formatKz(result.totalCompanyCost)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Official Angola IRT Brackets Table (Lei 28/20) */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Tabela Oficial de Escalões de IRT de Angola (Lei n.º 28/20)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Escalões progressivos do Grupo A (Trabalhadores por conta de outrem)
            </p>
          </div>
          <div className="text-xs text-neutral-500">
            Escalão activo destacado em <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">amarelo</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                <th className="py-2.5 px-3">Escalão</th>
                <th className="py-2.5 px-3">Rendimento Colectável (Kz)</th>
                <th className="py-2.5 px-3 text-right">Parcela Fixa</th>
                <th className="py-2.5 px-3 text-right">Taxa sobre o Excesso</th>
                <th className="py-2.5 px-3">Base do Excesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {ANGOLA_IRT_TIERS.map((tier, idx) => {
                const isSelected = result.irtTierApplied.min === tier.min;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-amber-50/90 font-medium text-amber-950'
                        : 'hover:bg-neutral-50/70 text-neutral-700'
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold">
                      {idx + 1}º Escalão {isSelected && '👈 (Seu)'}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {tier.max === null
                        ? `Superior a ${formatKz(tier.min - 1, false)}`
                        : idx === 0
                        ? `Até ${formatKz(tier.max, false)}`
                        : `${formatKz(tier.min, false)} a ${formatKz(tier.max, false)}`}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {tier.fixedAmount === 0 ? '0,00 Kz' : formatKz(tier.fixedAmount)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {tier.rate === 0 ? 'Isento (0%)' : formatPercent(tier.rate)}
                    </td>
                    <td className="py-2 px-3 text-neutral-500 text-[11px]">
                      {idx === 0 ? '-' : `Sobre o excesso de ${formatKz(tier.min - 1, false)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
