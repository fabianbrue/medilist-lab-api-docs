// Invented case, identifiers, list sources and item labels. No real drugs or patient records.
export const CASE_ID = 'case-demo-001';
export const medicationLists = [
  { id: 'list-hospital-demo-001', case_id: CASE_ID, source: 'hospital-demo', version: 1, captured_at: '2026-01-01T09:00:00Z', synthetic: true, entries: [
    { id: 'entry-hospital-alpha', demo_item_code: 'DEMO-ALPHA', display: 'Synthetic item Alpha — not a drug', source_record_id: 'record-demo-h-alpha' },
    { id: 'entry-hospital-beta', demo_item_code: 'DEMO-BETA', display: 'Synthetic item Beta — not a drug', source_record_id: 'record-demo-h-beta' }
  ] },
  { id: 'list-record-demo-001', case_id: CASE_ID, source: 'record-demo', version: 1, captured_at: '2026-01-01T09:05:00Z', synthetic: true, entries: [
    { id: 'entry-record-alpha', demo_item_code: 'DEMO-ALPHA', display: 'Synthetic item Alpha — not a drug', source_record_id: 'record-demo-r-alpha' },
    { id: 'entry-record-gamma', demo_item_code: 'DEMO-GAMMA', display: 'Synthetic item Gamma — not a drug', source_record_id: 'record-demo-r-gamma' }
  ] }
];
export const sourceVersions = Object.fromEntries(medicationLists.map(list => [list.source, list.version]));
export function compareLists() {
  const left = new Set(medicationLists[0].entries.map(entry => entry.demo_item_code));
  const right = new Set(medicationLists[1].entries.map(entry => entry.demo_item_code));
  return { case_id: CASE_ID, source_versions: { ...sourceVersions }, shared_codes: [...left].filter(code => right.has(code)), hospital_only_codes: [...left].filter(code => !right.has(code)), record_only_codes: [...right].filter(code => !left.has(code)), comparison_basis: 'exact_demo_item_code', clinical_validation_performed: false, synthetic: true };
}
