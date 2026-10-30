import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { CompanySettings, Employee, PayrollPeriod } from '../types/payroll';

const SETTINGS_COLLECTION = 'settings';
const EMPLOYEES_COLLECTION = 'employees';
const PERIODS_COLLECTION = 'payroll_periods';
const DEFAULT_SETTINGS_DOC_ID = 'company_profile';

export const DEFAULT_CLEAN_SETTINGS: CompanySettings = {
  name: 'Minha Empresa, Lda',
  nif: '5400000000',
  inssNumber: '00000000',
  commercialRegister: '',
  address: 'Luanda, Angola',
  city: 'Luanda',
  province: 'Luanda',
  phone: '+244 ',
  email: '',
  bankName: 'BAI - Banco Angolano de Investimentos',
  bankAccount: '',
  iban: 'AO06.',
  hrResponsibleName: '',
  hrResponsibleRole: 'Recursos Humanos',
  foodAllowanceExemptLimit: 30000,
  transportAllowanceExemptLimit: 30000,
  inssEmployeeRate: 0.03,
  inssEmployerRate: 0.08,
  workAccidentInsuranceRate: 0.015,
  workingHoursPerMonth: 173.33,
  workingDaysPerMonth: 22,
};

/**
 * Carrega as configurações da empresa do Firestore
 */
export async function loadCompanySettings(): Promise<CompanySettings> {
  const path = `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CompanySettings;
    }
    return DEFAULT_CLEAN_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Guarda ou actualiza as configurações da empresa no Firestore
 */
export async function saveCompanySettingsToDb(settings: CompanySettings): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/${DEFAULT_SETTINGS_DOC_ID}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, DEFAULT_SETTINGS_DOC_ID);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Ouve em tempo real a lista de colaboradores na base de dados
 */
export function subscribeEmployees(
  onData: (employees: Employee[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = EMPLOYEES_COLLECTION;
  try {
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Employee[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Employee);
        });
        // Ordena por código ou nome
        list.sort((a, b) => a.code.localeCompare(b.code));
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Adiciona um novo colaborador ao Firestore
 */
export async function addEmployeeToDb(employee: Employee): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employee.id}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(docRef, {
      ...employee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Actualiza um colaborador existente no Firestore
 */
export async function updateEmployeeInDb(employee: Employee): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employee.id}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    await setDoc(docRef, {
      ...employee,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Remove um colaborador do Firestore
 */
export async function deleteEmployeeFromDb(employeeId: string): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employeeId}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Ouve em tempo real os períodos de folha salarial
 */
export function subscribePayrollPeriods(
  onData: (periods: PayrollPeriod[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = PERIODS_COLLECTION;
  try {
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PayrollPeriod[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as PayrollPeriod);
        });
        // Ordena pelos mais recentes
        list.sort((a, b) => b.year - a.year || b.month - a.month);
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Guarda ou actualiza um período de folha no Firestore
 */
export async function savePayrollPeriodToDb(period: PayrollPeriod): Promise<void> {
  const path = `${PERIODS_COLLECTION}/${period.id}`;
  try {
    const docRef = doc(db, PERIODS_COLLECTION, period.id);
    await setDoc(docRef, period, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Elimina um período de processamento no Firestore
 */
export async function deletePayrollPeriodFromDb(periodId: string): Promise<void> {
  const path = `${PERIODS_COLLECTION}/${periodId}`;
  try {
    const docRef = doc(db, PERIODS_COLLECTION, periodId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
