import { getWmicProps } from './lib/win32/wmic.js';

const defaultProps = [
    'AdminPasswordStatus',
    'BootupState',
    'Caption',
    'ChassisBootupState',
    'CreationClassName',
    'CurrentTimeZone',
    'DaylightInEffect',
    'Description',
    'DNSHostName',
    'Domain',
    'DomainRole',
    'EnableDaylightSavingsTime',
    'FrontPanelResetStatus',
    'InfraredSupported',
    'InstallDate',
    'Manufacturer',
    'Model',
    'Name',
    'NumberOfLogicalProcessors',
    'NumberOfProcessors',
    'OEMStringArray',
    'PartOfDomain',
    'PauseAfterReset',
    'PowerOnPasswordStatus',
    'PowerState',
    'PowerSupplyState',
    'PrimaryOwnerName',
    'ResetCapability',
    'ResetCount',
    'ResetLimit',
    'Roles',
    'Status',
    'SupportContactDescription',
    'SystemFamily',
    'SystemSKUNumber',
    'SystemType',
    'TotalPhysicalMemory',
    'UserName',
    'WakeUpType',
    'Workgroup'
];

// Parameter from CLI args: node t.js [prop]
const propArg = process.argv[2];
const props = propArg ? [propArg] : defaultProps;

console.log('--- WMIC list output:');
const resultList = getWmicProps('Win32_ComputerSystem', props, { list: true });
console.log(resultList);

console.log('--- WMIC space-padded output:');
const resultList2 = getWmicProps('Win32_ComputerSystem', props, { flat: true });
console.log(resultList2);
