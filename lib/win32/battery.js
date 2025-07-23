export const BATTERY_STATUS = {
  1: 'Discharging',
  2: 'AC Connected',
  3: 'Fully Charged',
  4: 'Low',
  5: 'Critical',
  6: 'Charging',
  7: 'Charging and High',
  8: 'Charging and Low',
  9: 'Charging and Critical',
  10: 'Unknown [10]',
  11: 'Partially Charged',
};

export function getBatteryStatus(n) {
  return BATTERY_STATUS[n] || `Unknown [${n}]`;
}
