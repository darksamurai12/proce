/**
 * Definições de Tipos para o Sistema de Processamento Salarial de Angola
 * Legislação: LGT (Lei Geral do Trabalho), Código do IRT (Lei 28/20) e Lei da Segurança Social (INSS)
 */

export interface Employee {
  id: string;
  code: string; // Ex: EMP-001
  fullName: string;
  biNumber: string; // Bilhete de Identidade (ex: 004819283LA041)
  nif: string; // Número de Identificação Fiscal
  socialSecurityNumber: string; // Nº INSS (ex: 12049382)
  birthDate: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  address: string;
  city: string; // Ex: Luanda, Benguela, Huambo, Lobito, Lubango, Cabinda
  
  // Dados Contratuais
  department: string;
  role: string;
  admissionDate: string;
  contractType: 'determinado' | 'indeterminado' | 'estagio';
  status: 'active' | 'on_leave' | 'terminated';
  
  // Remuneração Base e Subsídios Fixos (em Kz)
  baseSalary: number;
  foodAllowance: number; // Subsídio de Alimentação (Isento até 30.000 Kz)
  transportAllowance: number; // Subsídio de Transporte (Isento até 30.000 Kz)
  roleAllowance: number; // Subsídio de Função/Chefia (Totalmente Tributável)
  familyAllowance: number; // Abono de Família
  housingAllowance: number; // Subsídio de Habitação
  communicationAllowance: number; // Subsídio de Comunicação
  otherFixedAllowances: number;
  dependentsCount: number;

  // Dados Bancários
  bankName: string; // Ex: BAI, BFA, Banco BIC, Millennium Atlântico, Standard Bank
  bankAccount: string;
  iban: string; // Formato AO06...
}

export interface IRTTier {
  min: number;
  max: number | null;
  fixedAmount: number;
  rate: number; // Em percentagem decimal (ex: 0.13 para 13%)
  description: string;
}

export interface PayrollInputItem {
  employeeId: string;
  daysWorked: number; // Habitualmente 22 ou 30 dias úteis
  daysAbsentUnjustified: number; // Faltas injustificadas
  overtimeHoursDay: number; // Horas extras normais (50% acréscimo)
  overtimeHoursNight: number; // Horas extras noturnas/feriados (100% acréscimo)
  bonus: number; // Gratificações ou prémios de produtividade
  salaryAdvance: number; // Adiantamentos salariais (desconto)
  unionFeePercent: number; // Quota sindical (geralmente 1% ou 0)
  otherDeductions: number; // Outros descontos (empréstimos, etc.)
  notes?: string;
}

export interface PayrollCalculationResult {
  employeeId: string;
  periodId: string;
  
  // Vencimentos e Remunerações
  baseSalary: number;
  effectiveBaseSalary: number; // Salário base deduzido de faltas
  foodAllowance: number;
  transportAllowance: number;
  roleAllowance: number;
  familyAllowance: number;
  housingAllowance: number;
  communicationAllowance: number;
  otherAllowances: number;
  
  // Horas Extras e Bónus
  overtimeDayAmount: number;
  overtimeNightAmount: number;
  totalOvertimeAmount: number;
  bonusAmount: number;
  absenceDeductionAmount: number;
  
  // Totais Brutos
  grossSalary: number; // Remuneração Ilíquida Total
  
  // Isenções Legais Fiscais
  exemptFoodAllowance: number; // Até 30.000 Kz
  taxableFoodAllowance: number; // Excesso
  exemptTransportAllowance: number; // Até 30.000 Kz
  taxableTransportAllowance: number; // Excesso
  exemptFamilyAllowance: number;
  totalExemptions: number;
  
  // Segurança Social (INSS Angola)
  inssSubjectBase: number; // Base de Incidência do INSS
  inssEmployeeRate: number; // 0.03 (3%)
  inssEmployeeAmount: number; // Desconto do Trabalhador (3%)
  inssEmployerRate: number; // 0.08 (8%)
  inssEmployerAmount: number; // Encargo da Entidade Patronal (8%)
  inssTotalAmount: number; // Total a entregar ao INSS (11%)
  
  // Imposto sobre o Rendimento do Trabalho (IRT Angola - Grupo A)
  irtTaxableBase: number; // Matéria Colectável = Gross - INSS 3% - Isenções
  irtTierApplied: IRTTier;
  irtFixedParcel: number;
  irtExcessRate: number;
  irtAmount: number; // Retenção na fonte de IRT
  
  // Outros Descontos
  unionFeeAmount: number;
  salaryAdvance: number;
  otherDeductions: number;
  totalDeductions: number; // INSS 3% + IRT + Adiantamentos + Outros
  
  // Salário Líquido
  netSalary: number;
  
  // Encargos Totais da Empresa
  workAccidentInsuranceRate: number; // ex: 1.5%
  workAccidentInsuranceAmount: number;
  totalCompanyCost: number; // Bruto + INSS Patronal (8%) + Seguro
}

export interface PayrollPeriod {
  id: string; // Ex: '2026-10'
  month: number; // 1-12
  year: number; // Ex: 2026
  label: string; // Ex: "Outubro 2026"
  type: 'regular' | 'vacation' | 'thirteenth'; // Salário regular, Férias, 13º mês
  status: 'draft' | 'processed' | 'approved' | 'paid';
  createdAt: string;
  processedAt?: string;
  approvedAt?: string;
  processedBy?: string;
  items: Record<string, PayrollInputItem>; // employeeId -> input
  results: Record<string, PayrollCalculationResult>; // employeeId -> result
}

export interface CompanySettings {
  name: string;
  nif: string; // NIF da empresa (ex: 5418293810)
  inssNumber: string; // Nº de Contribuinte INSS da Empresa (ex: 88472910)
  commercialRegister: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  bankName: string;
  bankAccount: string;
  iban: string;
  hrResponsibleName: string;
  hrResponsibleRole: string;
  
  // Parâmetros Fiscais de Angola
  foodAllowanceExemptLimit: number; // 30.000 Kz
  transportAllowanceExemptLimit: number; // 30.000 Kz
  inssEmployeeRate: number; // 3%
  inssEmployerRate: number; // 8%
  workAccidentInsuranceRate: number; // 1.5%
  workingHoursPerMonth: number; // 173.33 horas
  workingDaysPerMonth: number; // 22 dias
}
