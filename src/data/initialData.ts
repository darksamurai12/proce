import { CompanySettings, Employee, PayrollPeriod } from '../types/payroll';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  name: 'A Minha Empresa, Lda',
  nif: '',
  inssNumber: '',
  commercialRegister: '',
  address: 'Luanda, República de Angola',
  city: 'Luanda',
  province: 'Luanda',
  phone: '',
  email: '',
  bankName: 'BAI - Banco Angolano de Investimentos',
  bankAccount: '',
  iban: 'AO06.',
  hrResponsibleName: '',
  hrResponsibleRole: 'Responsável dos Recursos Humanos',
  foodAllowanceExemptLimit: 30000,
  transportAllowanceExemptLimit: 30000,
  inssEmployeeRate: 0.03,
  inssEmployerRate: 0.08,
  workAccidentInsuranceRate: 0.015,
  workingHoursPerMonth: 173.33,
  workingDaysPerMonth: 22
};

// Dados de teste removidos a pedido do utilizador para gravação limpa na base de dados
export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_PERIODS: PayrollPeriod[] = [];
