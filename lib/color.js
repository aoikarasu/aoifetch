import chalk from 'chalk';

export function colorUsagePercent(percent) {
  if (percent < 70) return chalk.green(percent + '%');
  if (percent < 90) return chalk.yellowBright(percent + '%');
  return chalk.red(percent + '%');
}

export function colorBatteryPercent(percent) {
  if (percent <= 10) return chalk.red(percent + '%');
  if (percent <= 30) return chalk.yellowBright(percent + '%');
  return chalk.green(percent + '%');
}

export function printColorBars() {
  const colors = [
    chalk.bgBlack('   '),
    chalk.bgRed('   '),
    chalk.bgGreen('   '),
    chalk.bgYellow('   '),
    chalk.bgBlue('   '),
    chalk.bgMagenta('   '),
    chalk.bgCyan('   '),
    chalk.bgWhite('   ')
  ];
  const bright = [
    chalk.bgGray('   '),
    chalk.bgRedBright('   '),
    chalk.bgGreenBright('   '),
    chalk.bgYellowBright('   '),
    chalk.bgBlueBright('   '),
    chalk.bgMagentaBright('   '),
    chalk.bgCyanBright('   '),
    chalk.bgWhiteBright('   ')
  ];
  console.log('\n' + colors.join('') + '\n' + bright.join('') + '\n');
}
