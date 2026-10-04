/**
 * Motor de Cálculo Salarial de Angola
 * Conformidade legal:
 * - Código do Imposto sobre o Rendimento do Trabalho (Lei n.º 28/20)
 * - Lei Geral do Trabalho de Angola (Lei n.º 12/23 e regulamentos)
 * - Regime da Segurança Social de Angola (INSS - Decreto Presidencial n.º 227/18)
 */

import { CompanySettings, Employee, IRTTier, PayrollCalculationResult, PayrollInputItem } from '../types/payroll';

// Tabela oficial do IRT de Angola (Grupo A - Trabalhadores por conta de outrem)
export const ANGOLA_IRT_TIERS: IRTTier[] = [
  {
    min: 0,
    max: 100000,
    fixedAmount: 0,
    rate: 0.0,
    description: 'Até 100.000 Kz: Isento'
  },
  {
    min: 100001,
    max: 150000,
    fixedAmount: 0,
    rate: 0.13,
    description: 'De 100.001 Kz a 150.000 Kz: 13% sobre o excesso de 100.000 Kz'
  },
  {
    min: 150001,
    max: 200000,
    fixedAmount: 6500,
    rate: 0.16,
    description: 'De 150.001 Kz a 200.000 Kz: 6.500 Kz + 16% sobre o excesso de 150.000 Kz'
  },
  {
    min: 200001,
    max: 300000,
    fixedAmount: 14500,
    rate: 0.18,
    description: 'De 200.001 Kz a 300.000 Kz: 14.500 Kz + 18% sobre o excesso de 200.000 Kz'
  },
  {
    min: 300001,
    max: 500000,
    fixedAmount: 32500,
    rate: 0.19,
    description: 'De 300.001 Kz a 500.000 Kz: 32.500 Kz + 19% sobre o excesso de 300.000 Kz'
  },
  {
    min: 500001,
    max: 1000000,
    fixedAmount: 70500,
    rate: 0.20,
    description: 'De 500.001 Kz a 1.000.000 Kz: 70.500 Kz + 20% sobre o excesso de 500.000 Kz'
  },
  {
    min: 1000001,
    max: 1500000,
    fixedAmount: 170500,
    rate: 0.21,
    description: 'De 1.000.001 Kz a 1.500.000 Kz: 170.500 Kz + 21% sobre o excesso de 1.000.000 Kz'
  },
  {
    min: 1500001,
    max: 2000000,
    fixedAmount: 275500,
    rate: 0.22,
    description: 'De 1.500.001 Kz a 2.000.000 Kz: 275.500 Kz + 22% sobre o excesso de 1.500.000 Kz'
  },
  {
    min: 2000001,
    max: 2500000,
    fixedAmount: 385500,
    rate: 0.23,
    description: 'De 2.000.001 Kz a 2.500.000 Kz: 385.500 Kz + 23% sobre o excesso de 2.000.000 Kz'
  },
  {
    min: 2500001,
    max: 5000000,
    fixedAmount: 500500,
    rate: 0.24,
    description: 'De 2.500.001 Kz a 5.000.000 Kz: 500.500 Kz + 24% sobre o excesso de 2.500.000 Kz'
  },
  {
    min: 5000001,
    max: 10000000,
    fixedAmount: 1100500,
    rate: 0.245,
    description: 'De 5.000.001 Kz a 10.000.000 Kz: 1.100.500 Kz + 24.5% sobre o excesso de 5.000.000 Kz'
  },
  {
    min: 10000001,
    max: null,
    fixedAmount: 2325500,
    rate: 0.25,
    description: 'Superior a 10.000.000 Kz: 2.325.500 Kz + 25% sobre o excesso de 10.000.000 Kz'
  }
];

/**
 * Encontra o escalão de IRT correspondente à Matéria Colectável
 */
export function getIRTTier(taxableBase: number): IRTTier {
  if (taxableBase <= 100000) {
    return ANGOLA_IRT_TIERS[0];
  }
  for (const tier of ANGOLA_IRT_TIERS) {
    if (tier.max === null) {
      if (taxableBase >= tier.min) return tier;
    } else {
      if (taxableBase >= tier.min && taxableBase <= tier.max) {
        return tier;
      }
    }
  }
  return ANGOLA_IRT_TIERS[ANGOLA_IRT_TIERS.length - 1];
}

/**
 * Calcula o IRT para uma determinada Matéria Colectável
 */
export function calculateIRT(taxableBase: number): {
  taxableBase: number;
  tier: IRTTier;
  fixedParcel: number;
  excessRate: number;
  excessAmount: number;
  taxAmount: number;
} {
  const roundedBase = Math.max(0, Math.floor(taxableBase));
  const tier = getIRTTier(roundedBase);

  if (roundedBase <= 100000) {
    return {
      taxableBase: roundedBase,
      tier,
      fixedParcel: 0,
      excessRate: 0,
      excessAmount: 0,
      taxAmount: 0
    };
  }

  // O excesso é calculado sobre o limiar inferior daquele escalão (ou seja, min - 1)
  const lowerThreshold = tier.min - 1;
  const excessAmount = Math.max(0, roundedBase - lowerThreshold);
  const taxAmount = tier.fixedAmount + excessAmount * tier.rate;

  return {
    taxableBase: roundedBase,
    tier,
    fixedParcel: tier.fixedAmount,
    excessRate: tier.rate,
    excessAmount,
    taxAmount: Math.round(taxAmount * 100) / 100
  };
}

/**
 * Executa o cálculo integral de processamento salarial para um colaborador
 */
export function calculateEmployeePayroll(
  employee: Employee,
  input: PayrollInputItem,
  settings: CompanySettings,
  periodId: string
): PayrollCalculationResult {
  const workingDays = settings.workingDaysPerMonth || 22;
  const workingHoursMonth = settings.workingHoursPerMonth || 173.33;

  // Valor hora e valor dia base
  const hourlyRate = employee.baseSalary / workingHoursMonth;
  const dailyRate = employee.baseSalary / workingDays;

  // Dedução de Faltas injustificadas
  const absenceDays = Math.max(0, input.daysAbsentUnjustified || 0);
  const absenceDeductionAmount = Math.round(absenceDays * dailyRate * 100) / 100;
  const effectiveBaseSalary = Math.max(0, employee.baseSalary - absenceDeductionAmount);

  // Horas Extras (LGT Angola)
  // Horas normais/diurnas: acréscimo de 50% = 1.5x valor hora
  const overtimeDayHours = Math.max(0, input.overtimeHoursDay || 0);
  const overtimeDayAmount = Math.round(overtimeDayHours * (hourlyRate * 1.5) * 100) / 100;

  // Horas noturnas / feriados / descanso semanal: acréscimo de 100% = 2.0x valor hora
  const overtimeNightHours = Math.max(0, input.overtimeHoursNight || 0);
  const overtimeNightAmount = Math.round(overtimeNightHours * (hourlyRate * 2.0) * 100) / 100;

  const totalOvertimeAmount = overtimeDayAmount + overtimeNightAmount;
  const bonusAmount = Math.max(0, input.bonus || 0);

  // Subsídios
  const foodAllowance = employee.foodAllowance || 0;
  const transportAllowance = employee.transportAllowance || 0;
  const roleAllowance = employee.roleAllowance || 0;
  const familyAllowance = employee.familyAllowance || 0;
  const housingAllowance = employee.housingAllowance || 0;
  const communicationAllowance = employee.communicationAllowance || 0;
  const otherAllowances = employee.otherFixedAllowances || 0;

  // Remuneração Bruta Ilíquida Total
  const grossSalary =
    effectiveBaseSalary +
    foodAllowance +
    transportAllowance +
    roleAllowance +
    familyAllowance +
    housingAllowance +
    communicationAllowance +
    otherAllowances +
    totalOvertimeAmount +
    bonusAmount;

  // Limites de isenção legal de subsídios em Angola (30.000 Kz para alimentação e transporte)
  const foodExemptLimit = settings.foodAllowanceExemptLimit ?? 30000;
  const transportExemptLimit = settings.transportAllowanceExemptLimit ?? 30000;

  const exemptFoodAllowance = Math.min(foodAllowance, foodExemptLimit);
  const taxableFoodAllowance = Math.max(0, foodAllowance - foodExemptLimit);

  const exemptTransportAllowance = Math.min(transportAllowance, transportExemptLimit);
  const taxableTransportAllowance = Math.max(0, transportAllowance - transportExemptLimit);

  // Abono de família é isento
  const exemptFamilyAllowance = familyAllowance;
  const totalExemptions = exemptFoodAllowance + exemptTransportAllowance + exemptFamilyAllowance;

  // Base de Incidência do INSS (Segurança Social de Angola)
  // Sujeita: Salário Base efectivo + Subsídio Função + Horas Extras + Bónus + Habitação + Comunicação + Excedente de Alimentação e Transporte
  const inssSubjectBase =
    effectiveBaseSalary +
    roleAllowance +
    housingAllowance +
    communicationAllowance +
    otherAllowances +
    totalOvertimeAmount +
    bonusAmount +
    taxableFoodAllowance +
    taxableTransportAllowance;

  // INSS 3% (Trabalhador)
  const inssEmployeeRate = settings.inssEmployeeRate ?? 0.03;
  const inssEmployeeAmount = Math.round(inssSubjectBase * inssEmployeeRate * 100) / 100;

  // INSS 8% (Entidade Patronal)
  const inssEmployerRate = settings.inssEmployerRate ?? 0.08;
  const inssEmployerAmount = Math.round(inssSubjectBase * inssEmployerRate * 100) / 100;
  const inssTotalAmount = inssEmployeeAmount + inssEmployerAmount;

  // Matéria Colectável de IRT (Código do IRT Lei 28/20)
  // MC = Rendimento Bruto - INSS Trabalhador (3%) - Isenções legais (Alimentação até 30k, Transporte até 30k, Abono Família)
  const irtTaxableBase = Math.max(0, grossSalary - inssEmployeeAmount - totalExemptions);

  // Cálculo do IRT
  const irtCalc = calculateIRT(irtTaxableBase);
  const irtAmount = irtCalc.taxAmount;

  // Outros Descontos
  const unionFeeRate = (input.unionFeePercent || 0) / 100;
  const unionFeeAmount = Math.round(employee.baseSalary * unionFeeRate * 100) / 100;
  const salaryAdvance = Math.max(0, input.salaryAdvance || 0);
  const otherDeductions = Math.max(0, input.otherDeductions || 0);

  const totalDeductions =
    inssEmployeeAmount +
    irtAmount +
    unionFeeAmount +
    salaryAdvance +
    otherDeductions;

  // Salário Líquido a Receber pelo Trabalhador
  const netSalary = Math.round((grossSalary - totalDeductions) * 100) / 100;

  // Encargos da Empresa
  const workAccidentInsuranceRate = settings.workAccidentInsuranceRate ?? 0.015;
  const workAccidentInsuranceAmount = Math.round(grossSalary * workAccidentInsuranceRate * 100) / 100;
  const totalCompanyCost = Math.round((grossSalary + inssEmployerAmount + workAccidentInsuranceAmount) * 100) / 100;

  return {
    employeeId: employee.id,
    periodId,
    baseSalary: employee.baseSalary,
    effectiveBaseSalary,
    foodAllowance,
    transportAllowance,
    roleAllowance,
    familyAllowance,
    housingAllowance,
    communicationAllowance,
    otherAllowances,
    overtimeDayAmount,
    overtimeNightAmount,
    totalOvertimeAmount,
    bonusAmount,
    absenceDeductionAmount,
    grossSalary,
    exemptFoodAllowance,
    taxableFoodAllowance,
    exemptTransportAllowance,
    taxableTransportAllowance,
    exemptFamilyAllowance,
    totalExemptions,
    inssSubjectBase,
    inssEmployeeRate,
    inssEmployeeAmount,
    inssEmployerRate,
    inssEmployerAmount,
    inssTotalAmount,
    irtTaxableBase,
    irtTierApplied: irtCalc.tier,
    irtFixedParcel: irtCalc.fixedParcel,
    irtExcessRate: irtCalc.excessRate,
    irtAmount,
    unionFeeAmount,
    salaryAdvance,
    otherDeductions,
    totalDeductions,
    netSalary,
    workAccidentInsuranceRate,
    workAccidentInsuranceAmount,
    totalCompanyCost
  };
}

/**
 * Simulação rápida de Salário Bruto para Líquido
 */
export function simulateGrossToNet(params: {
  baseSalary: number;
  foodAllowance?: number;
  transportAllowance?: number;
  roleAllowance?: number;
  bonus?: number;
  overtimeHours?: number;
}): PayrollCalculationResult {
  const dummyEmployee: Employee = {
    id: 'sim-employee',
    code: 'SIM-001',
    fullName: 'Simulação de Colaborador',
    biNumber: '000000000LA000',
    nif: '0000000000',
    socialSecurityNumber: '00000000',
    birthDate: '1990-01-01',
    gender: 'M',
    phone: '',
    email: '',
    address: 'Luanda, Angola',
    city: 'Luanda',
    department: 'Operações',
    role: 'Técnico',
    admissionDate: '2024-01-01',
    contractType: 'indeterminado',
    status: 'active',
    baseSalary: params.baseSalary || 0,
    foodAllowance: params.foodAllowance || 0,
    transportAllowance: params.transportAllowance || 0,
    roleAllowance: params.roleAllowance || 0,
    familyAllowance: 0,
    housingAllowance: 0,
    communicationAllowance: 0,
    otherFixedAllowances: 0,
    dependentsCount: 0,
    bankName: 'BAI',
    bankAccount: '000000000',
    iban: 'AO06.0040.0000.0000.0000.0000.0'
  };

  const dummyInput: PayrollInputItem = {
    employeeId: dummyEmployee.id,
    daysWorked: 22,
    daysAbsentUnjustified: 0,
    overtimeHoursDay: params.overtimeHours || 0,
    overtimeHoursNight: 0,
    bonus: params.bonus || 0,
    salaryAdvance: 0,
    unionFeePercent: 0,
    otherDeductions: 0
  };

  const defaultSettings: CompanySettings = {
    name: 'Empresa Teste',
    nif: '5400000000',
    inssNumber: '10000000',
    commercialRegister: '000/00',
    address: 'Luanda',
    city: 'Luanda',
    province: 'Luanda',
    phone: '',
    email: '',
    bankName: 'BAI',
    bankAccount: '',
    iban: '',
    hrResponsibleName: '',
    hrResponsibleRole: '',
    foodAllowanceExemptLimit: 30000,
    transportAllowanceExemptLimit: 30000,
    inssEmployeeRate: 0.03,
    inssEmployerRate: 0.08,
    workAccidentInsuranceRate: 0.015,
    workingHoursPerMonth: 173.33,
    workingDaysPerMonth: 22
  };

  return calculateEmployeePayroll(dummyEmployee, dummyInput, defaultSettings, 'sim-period');
}
