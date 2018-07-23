import chalk from "chalk";

class ChalkConsole {
  static info(message) {
    console.log(chalk.cyan(`${chalk.bold(`INFO:`)} ${message}`));
  }

  static debug(message) {
    console.log(chalk.yellow(`${chalk.bold(`DEBUG:`)} ${message}`));
  }

  static error(message) {
    console.log(chalk.red(`${chalk.bold(`ERROR:`)} ${message}`));
  }
}

export default ChalkConsole;
