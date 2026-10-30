# Security Spec - KwanzaFolha Angola

## 1. Data Invariants
1. Company settings must have valid NIF and INSS company registration numbers.
2. Employee records require a valid Angolan BI / NIF, full name, employee code, and non-negative base salary.
3. Payroll periods require a valid year, month, label, and allowed status ('draft', 'processed', 'approved', 'paid').
4. Document IDs must conform to alphanumeric + hyphen/underscore patterns.
5. All operations are restricted to authenticated users.

## 2. The "Dirty Dozen" Threat Vectors
1. Unauthenticated reading of employee PII (BI, IBAN, salaries).
2. Unauthenticated insertion or deletion of employees.
3. Negative salary manipulation.
4. Document ID injection with oversized payloads.
5. Tampering with company tax parameters by unauthorized callers.
6. Deletion of payroll periods by non-authenticated callers.
7. Overwriting immutable employee IDs with spoofed records.
8. Injection of arbitrary unknown fields into employee objects.
9. Modifying payroll calculation results without valid period metadata.
10. Malformed contract type or status values.
11. PII data scraping via wide unbounded queries.
12. Cross-tenant state mutation attempts.
