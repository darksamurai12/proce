import React, { useState } from 'react';
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Loader2,
  Printer, 
  User 
} from 'lucide-react';
import { CompanySettings, Employee, PayrollPeriod } from '../../types/payroll';
import { formatDatePT, formatKz, numberToWordsKz } from '../../utils/formatters';
import { exportElementToPdf } from '../../utils/pdfGenerator';

interface PayslipViewProps {
  period?: PayrollPeriod | null;
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const currentEmployeeIndex = employees.findIndex((e) => e.id === currentEmpId);
  const currentEmployee = employees[currentEmployeeIndex] || employees[0];
  const calculation = currentEmployee && period?.results ? period.results[currentEmployee.id] : null;

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

  const handleExportPdf = async () => {
    if (!currentEmployee || !period) return;
    setIsGeneratingPdf(true);
    try {
      const cleanEmpName = currentEmployee.fullName.replace(/\s+/g, '_');
      const filename = `Recibo_${currentEmployee.code}_${cleanEmpName}_${period.id}`;
      await exportElementToPdf({
        filename,
        elementId: 'payslip-document',
      });
    } catch (e) {
      console.error('Falha ao exportar PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    handleExportPdf();
    try {
      window.print();
    } catch {
      // Ignora erro se sandboxed
    }
  };

  if (!period || !currentEmployee || !calculation) {
    return (
      <div className="p-16 text-center bg-white rounded-xl border border-neutral-200 max-w-lg mx-auto space-y-3">
        <p className="text-sm font-semibold text-neutral-800">
          Nenhum recibo de vencimento disponível.
        </p>
        <p className="text-xs text-neutral-500">
          {!period
            ? 'Crie ou selecione uma folha de processamento salarial para emitir os recibos.'
            : 'Adicione colaboradores e processe a folha para gerar os recibos de vencimento oficiais.'}
        </p>
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
            onClick={handleExportPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 disabled:opacity-60 transition-colors shadow-xs"
            title="Descarregar recibo em formato PDF oficial"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'A Gerar PDF...' : 'Exportar PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
            title="Imprimir documento via navegador"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Scroll container for responsiveness on small screens without affecting print document dimensions */}
      <div className="w-full overflow-x-auto pb-8 pt-2 flex justify-start xl:justify-center">
        <div 
          id="payslip-document"
          style={{ width: '800px', minWidth: '800px' }}
          className="bg-white p-8 font-sans print:p-0 print:m-0 text-neutral-900 shrink-0"
        >
          
          {/* Document Header com o Logo por CIMA da WE BUSINESS CONSULTING */}
          <div className="border-b-2 border-neutral-900 pb-4">
            <div className="flex justify-between items-start gap-4">
              
              {/* Logótipo por cima da empresa */}
              <div className="flex flex-col items-start gap-2 max-w-[500px]">
                <img
                  src="/assets/aistudio/logo_2_4756bbe5.png"
                  alt="WE Business Consulting"
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-neutral-900 uppercase">
                    {settings.name || 'WE BUSINESS CONSULTING - PRESTAÇAO DE SERVIÇOS, LDA'}
                  </h1>
                  <div className="text-[11px] text-neutral-600 mt-0.5 space-y-0.5">
                    <div>
                      {settings.nif && (
                        <span>
                          NIF: <strong className="font-mono text-neutral-800">{settings.nif}</strong>
                        </span>
                      )}
                    </div>
                    <div>{settings.address || 'Benfica – Edifício Lumir, Luanda'} · República de Angola</div>
                    {(settings.phone || settings.email) && (
                      <div>Contactos: {settings.phone} {settings.email ? `· ${settings.email}` : ''}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selo do Recibo */}
              <div className="text-right shrink-0">
                <div className="inline-block bg-neutral-900 text-white px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider">
                  Recibo de Vencimento
                </div>
                <div className="text-xs font-semibold text-neutral-900 mt-2">
                  Período: <span>{period.label}</span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                  Nº: REC-{period.id}-{currentEmployee.code}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Emissão: {new Date().toLocaleDateString('pt-AO')}
                </div>
              </div>
            </div>
          </div>

          {/* Employee Identification (4 Colunas rígidas para documento oficial) */}
          <div className="my-4 p-3.5 bg-neutral-50 border border-neutral-200 rounded-md">
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Código:</span>
                <span className="font-mono font-bold text-neutral-900 text-sm">{currentEmployee.code}</span>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Nome do Colaborador:</span>
                <span className="font-bold text-neutral-900 text-sm">{currentEmployee.fullName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Cargo / Função:</span>
                <span className="font-medium text-neutral-900">{currentEmployee.role || 'Colaborador'}</span>
              </div>
            </div>
            {currentEmployee.department && (
              <div className="mt-2.5 pt-2 border-t border-neutral-200 text-[11px] text-neutral-600">
                Departamento: <strong className="text-neutral-800">{currentEmployee.department}</strong>
              </div>
            )}
          </div>

          {/* Detailed Breakdown: Earnings & Deductions Tables (2 colunas perfeitas de 50%) */}
          <div className="grid grid-cols-2 gap-4 my-4">
            
            {/* Earnings Column */}
            <div className="border border-neutral-200 rounded-md overflow-hidden flex flex-col">
              <div className="bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200">
                Rendimentos / Vencimentos (Kwanzas)
              </div>
              <div className="p-3 flex-1 space-y-1.5 text-xs divide-y divide-neutral-100">
                
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
                        (Isento: {formatKz(calculation.exemptFoodAllowance, false)})
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
                        (Isento: {formatKz(calculation.exemptTransportAllowance, false)})
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
                      <span className="block text-[10px] text-emerald-600">(Isento)</span>
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
                    <span className="text-neutral-700">Horas Extras</span>
                    <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.totalOvertimeAmount)}</span>
                  </div>
                )}

                {calculation.bonusAmount > 0 && (
                  <div className="flex justify-between pt-1">
                    <span className="text-neutral-700">Prémio / Bónus</span>
                    <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.bonusAmount)}</span>
                  </div>
                )}

              </div>

              <div className="bg-neutral-50 px-3 py-2 border-t border-neutral-200 flex justify-between text-xs font-bold text-neutral-900">
                <span>Total Ilíquido (Bruto):</span>
                <span className="font-mono text-sm">{formatKz(calculation.grossSalary)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-neutral-200 rounded-md overflow-hidden flex flex-col">
              <div className="bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wide border-b border-neutral-200">
                Descontos Legais & Fiscais (Kwanzas)
              </div>
              <div className="p-3 flex-1 space-y-1.5 text-xs divide-y divide-neutral-100">
                
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
                    <span className="font-medium text-neutral-800">Retenção de IRT (AGT)</span>
                    <span className="block text-[10px] text-neutral-400">
                      Matéria Colectável: {formatKz(calculation.irtTaxableBase, false)}
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
                    <span className="text-neutral-700">Adiantamento Salarial</span>
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

              <div className="bg-neutral-50 px-3 py-2 border-t border-neutral-200 flex justify-between text-xs font-bold text-neutral-900">
                <span>Total de Deduções:</span>
                <span className="font-mono text-sm">{formatKz(calculation.totalDeductions)}</span>
              </div>
            </div>

          </div>

          {/* Net Salary Highlight Box (Sem Forma de Pagamento conforme solicitado) */}
          <div className="p-4 bg-neutral-900 text-white rounded-md my-4 print:bg-neutral-100 print:text-neutral-900 print:border print:border-neutral-400">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 print:text-neutral-600 block font-semibold">
                Líquido Total a Receber:
              </span>
              <div className="text-3xl font-extrabold font-mono tracking-tight mt-0.5 print:text-black">
                {formatKz(calculation.netSalary)}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-neutral-800 print:border-neutral-300 text-xs italic text-neutral-300 print:text-neutral-800">
              <strong>Valor por extenso:</strong> {numberToWordsKz(calculation.netSalary)}
            </div>
          </div>

          {/* Informative Box: Employer Contributions (Transparência legal) */}
          <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-[11px] text-neutral-600 flex justify-between items-center">
            <div>
              <strong>Encargos Patronais:</strong> INSS Patronal (8%):{' '}
              <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.inssEmployerAmount)}</span> · Total INSS (11%):{' '}
              <span className="font-mono font-medium text-neutral-900">{formatKz(calculation.inssTotalAmount)}</span>
            </div>
            <div>
              Custo Total Empresa:{' '}
              <span className="font-mono font-semibold text-neutral-900">{formatKz(calculation.totalCompanyCost)}</span>
            </div>
          </div>

          {/* Signatures & Formal Stamping Area */}
          <div className="mt-8 pt-5 border-t border-neutral-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-9 border-b border-neutral-400 mx-6"></div>
              <div className="mt-1.5 font-medium text-neutral-800 text-[11px]">
                A Entidade Empregadora
              </div>
              <div className="text-[10px] text-neutral-500">
                {settings.name || 'WE BUSINESS CONSULTING - PRESTAÇAO DE SERVIÇOS, LDA'}
              </div>
            </div>

            <div>
              <div className="h-9 border-b border-neutral-400 mx-6"></div>
              <div className="mt-1.5 font-medium text-neutral-800 text-[11px]">
                O Trabalhador (Conforme e Recebido)
              </div>
              <div className="text-[10px] text-neutral-500">
                Data: ____ / ____ / ________
              </div>
            </div>
          </div>

          <div className="mt-5 text-center text-[10px] text-neutral-400">
            Documento processado por computador · Nos termos do Art. 165º da Lei Geral do Trabalho de Angola
          </div>

        </div>
      </div>

    </div>
  );
};
