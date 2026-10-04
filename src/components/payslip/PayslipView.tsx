import React, { useState } from 'react';
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Printer, 
  User 
} from 'lucide-react';
import { CompanySettings, Employee, PayrollPeriod } from '../../types/payroll';
import { formatDatePT, formatKz, numberToWordsKz } from '../../utils/formatters';

interface PayslipViewProps {
  period: PayrollPeriod;
  employees: Employee[];
  settings: CompanySettings;
  selectedEmployeeId?: string;
}

export const PayslipView: React.FC<PayslipViewProps> = ({
  period,
  employees,
  settings,
  selectedEmployeeId
}) => {
  const [currentEmpId, setCurrentEmpId] = useState<string>(
    selectedEmployeeId || (employees[0]?.id ?? '')
  );

  const currentEmployeeIndex = employees.findIndex((e) => e.id === currentEmpId);
  const currentEmployee = employees[currentEmployeeIndex] || employees[0];
  const calculation = currentEmployee ? period.results[currentEmployee.id] : null;

  const handleNext = () => {
    if (currentEmployeeIndex < employees.length - 1) {
      setCurrentEmpId(employees[currentEmployeeIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentEmployeeIndex > 0) {
      setCurrentEmpId(employees[currentEmployeeIndex - 1].id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentEmployee || !calculation) {
    return (
      <div className="p-12 text-center text-neutral-500">
        Nenhum recibo de vencimento disponível para este colaborador ou período.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Recibo de Vencimento Oficial
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Conforme a Lei Geral do Trabalho de Angola, Código do IRT (Lei 28/20) e Segurança Social
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Selector Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-md p-0.5">
            <button
              onClick={handlePrev}
              disabled={currentEmployeeIndex <= 0}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-100"
              title="Colaborador Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentEmpId}
              onChange={(e) => setCurrentEmpId(e.target.value)}
              className="text-xs font-medium py-1 px-2 text-neutral-800 bg-transparent border-none focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.code} - {emp.fullName}
                </option>
              ))}
            </select>

            <button
              onClick={handleNext}
              disabled={currentEmployeeIndex >= employees.length - 1}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 rounded hover:bg-neutral-100"
              title="Próximo Colaborador"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Recibo / PDF</span>
          </button>
        </div>
      </div>

      {/* Payslip Document Canvas (A4 / Printable representation) */}
      <div className="max-w-4xl mx-auto bg-white border border-neutral-300 rounded-xl shadow-xs p-8 sm:p-10 font-sans print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-full">
        
        {/* Document Header */}
        <div className="border-b-2 border-neutral-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
                {settings.name}
              </div>
              <div className="text-xs text-neutral-600 mt-1 space-y-0.5">
                <div>NIF: <span className="font-mono font-medium text-neutral-900">{settings.nif}</span> · Nº INSS: <span className="font-mono font-medium text-neutral-900">{settings.inssNumber}</span></div>
                <div>{settings.address}, {settings.city} - República de Angola</div>
                <div>Contactos: {settings.phone} · {settings.email}</div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block bg-neutral-100 px-3 py-1 rounded text-xs font-bold uppercase text-neutral-900 border border-neutral-300">
                Recibo de Vencimento
              </div>
              <div className="text-xs font-medium text-neutral-700 mt-2">
                Período: <span className="font-bold text-neutral-900">{period.label}</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                Ref: REC-{period.id}-{currentEmployee.code}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Identification Card */}
        <div className="my-5 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Código / Mecanográfico:</span>
              <span className="font-mono font-bold text-neutral-900">{currentEmployee.code}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Nome Completo:</span>
              <span className="font-bold text-neutral-900">{currentEmployee.fullName}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Bilhete de Identidade (BI):</span>
              <span className="font-mono font-medium text-neutral-900">{currentEmployee.biNumber}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">NIF do Trabalhador:</span>
              <span className="font-mono font-medium text-neutral-900">{currentEmployee.nif}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Nº Segurança Social:</span>
              <span className="font-mono font-medium text-neutral-900">{currentEmployee.socialSecurityNumber || 'Pendente'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Departamento:</span>
              <span className="font-medium text-neutral-900">{currentEmployee.department}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Cargo / Função:</span>
              <span className="font-medium text-neutral-900">{currentEmployee.role}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">Data de Admissão:</span>
              <span className="font-medium text-neutral-900">{formatDatePT(currentEmployee.admissionDate)}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-600 gap-2">
            <div>
              Banco: <strong className="text-neutral-800">{currentEmployee.bankName}</strong>
            </div>
            <div>
              IBAN: <strong className="font-mono text-neutral-900">{currentEmployee.iban}</strong>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          
          {/* Earnings Column */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200">
              Rendimentos / Vencimentos (Kwanzas)
            </div>
            <div className="p-3 flex-1 space-y-2 text-xs divide-y divide-neutral-100">
              
              <div className="flex justify-between pt-1">
                <span className="text-neutral-700">Salário Base</span>
                <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.baseSalary)}</span>
              </div>

              {calculation.absenceDeductionAmount > 0 && (
                <div className="flex justify-between pt-1 text-red-600">
                  <span>Dedução de Faltas</span>
                  <span className="font-mono">-{formatKz(calculation.absenceDeductionAmount)}</span>
                </div>
              )}

              {calculation.foodAllowance > 0 && (
                <div className="flex justify-between pt-1">
                  <div>
                    <span className="text-neutral-700">Subsídio de Alimentação</span>
                    <span className="block text-[10px] text-neutral-400">
                      (Isento: {formatKz(calculation.exemptFoodAllowance, false)} · Trib.: {formatKz(calculation.taxableFoodAllowance, false)})
                    </span>
                  </div>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.foodAllowance)}</span>
                </div>
              )}

              {calculation.transportAllowance > 0 && (
                <div className="flex justify-between pt-1">
                  <div>
                    <span className="text-neutral-700">Subsídio de Transporte</span>
                    <span className="block text-[10px] text-neutral-400">
                      (Isento: {formatKz(calculation.exemptTransportAllowance, false)} · Trib.: {formatKz(calculation.taxableTransportAllowance, false)})
                    </span>
                  </div>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.transportAllowance)}</span>
                </div>
              )}

              {calculation.roleAllowance > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Subsídio de Função / Chefia</span>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.roleAllowance)}</span>
                </div>
              )}

              {calculation.familyAllowance > 0 && (
                <div className="flex justify-between pt-1">
                  <div>
                    <span className="text-neutral-700">Abono de Família</span>
                    <span className="block text-[10px] text-emerald-600">(Isento por Lei)</span>
                  </div>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.familyAllowance)}</span>
                </div>
              )}

              {calculation.housingAllowance > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Subsídio de Habitação</span>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.housingAllowance)}</span>
                </div>
              )}

              {calculation.communicationAllowance > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Subsídio de Comunicação</span>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.communicationAllowance)}</span>
                </div>
              )}

              {calculation.totalOvertimeAmount > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Horas Extras / Trabalho Suplementar</span>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.totalOvertimeAmount)}</span>
                </div>
              )}

              {calculation.bonusAmount > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Prémio / Bónus de Produtividade</span>
                  <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.bonusAmount)}</span>
                </div>
              )}

            </div>

            <div className="bg-neutral-50 px-3 py-2.5 border-t border-neutral-200 flex justify-between text-xs font-bold text-neutral-900">
              <span>Total Ilíquido (Bruto):</span>
              <span className="font-mono text-sm">{formatKz(calculation.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200">
              Descontos Legais & Outros (Kwanzas)
            </div>
            <div className="p-3 flex-1 space-y-2 text-xs divide-y divide-neutral-100">
              
              {/* INSS 3% */}
              <div className="flex justify-between pt-1">
                <div>
                  <span className="font-medium text-neutral-800">Segurança Social (INSS 3%)</span>
                  <span className="block text-[10px] text-neutral-400">
                    Incidência: {formatKz(calculation.inssSubjectBase, false)}
                  </span>
                </div>
                <span className="font-mono font-semibold text-neutral-900">{formatKz(calculation.inssEmployeeAmount)}</span>
              </div>

              {/* IRT */}
              <div className="flex justify-between pt-1">
                <div>
                  <span className="font-medium text-neutral-800">Retenção na Fonte de IRT</span>
                  <span className="block text-[10px] text-neutral-400">
                    Matéria Colectável: {formatKz(calculation.irtTaxableBase, false)} · {calculation.irtTierApplied.description}
                  </span>
                </div>
                <span className="font-mono font-semibold text-neutral-900">{formatKz(calculation.irtAmount)}</span>
              </div>

              {/* Quota Sindical */}
              {calculation.unionFeeAmount > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Quota Sindical</span>
                  <span className="font-mono text-neutral-900">{formatKz(calculation.unionFeeAmount)}</span>
                </div>
              )}

              {/* Adiantamento Salarial */}
              {calculation.salaryAdvance > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Adiantamento Salarial (Vale)</span>
                  <span className="font-mono text-neutral-900">{formatKz(calculation.salaryAdvance)}</span>
                </div>
              )}

              {/* Outros Descontos */}
              {calculation.otherDeductions > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-700">Outros Descontos</span>
                  <span className="font-mono text-neutral-900">{formatKz(calculation.otherDeductions)}</span>
                </div>
              )}

            </div>

            <div className="bg-neutral-50 px-3 py-2.5 border-t border-neutral-200 flex justify-between text-xs font-bold text-neutral-900">
              <span>Total de Deduções:</span>
              <span className="font-mono text-sm">{formatKz(calculation.totalDeductions)}</span>
            </div>
          </div>

        </div>

        {/* Net Salary Highlight Box with Text in Words */}
        <div className="p-5 bg-neutral-900 text-white rounded-lg my-6 print:bg-neutral-100 print:text-neutral-900 print:border print:border-neutral-400">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400 print:text-neutral-600 block">
                Líquido Total a Receber pelo Trabalhador:
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-1 print:text-black">
                {formatKz(calculation.netSalary)}
              </div>
            </div>

            <div className="sm:text-right text-xs text-neutral-300 print:text-neutral-700">
              <span className="text-[10px] text-neutral-400 print:text-neutral-600 block uppercase">
                Forma de Pagamento:
              </span>
              <span>Transferência Bancária ({currentEmployee.bankName})</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 print:border-neutral-300 text-xs italic text-neutral-300 print:text-neutral-800">
            <strong>Valor por extenso:</strong> {numberToWordsKz(calculation.netSalary)}
          </div>
        </div>

        {/* Informative Box: Employer Contributions (Transparência legal) */}
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-[11px] text-neutral-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong>Encargos da Entidade Patronal:</strong> INSS Patronal (8%):{' '}
            <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.inssEmployerAmount)}</span> · Total entregue ao INSS (11%):{' '}
            <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.inssTotalAmount)}</span>
          </div>
          <div>
            Custo Total para a Empresa:{' '}
            <span className="font-mono font-semibold text-neutral-900">{formatKz(calculation.totalCompanyCost)}</span>
          </div>
        </div>

        {/* Signatures & Formal Stamping Area */}
        <div className="mt-12 pt-8 border-t border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-12 border-b border-neutral-400 mx-6"></div>
            <div className="mt-2 font-medium text-neutral-800">
              A Entidade Empregadora / Recursos Humanos
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{settings.hrResponsibleName}</div>
          </div>

          <div>
            <div className="h-12 border-b border-neutral-400 mx-6"></div>
            <div className="mt-2 font-medium text-neutral-800">
              O Trabalhador (Conforme e Recebido)
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">
              Data: ____ / ____ / ________
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-neutral-400">
          Documento processado por computador via KwanzaFolha Angola · Nos termos do Art. 165º da Lei Geral do Trabalho
        </div>

      </div>

    </div>
  );
};
