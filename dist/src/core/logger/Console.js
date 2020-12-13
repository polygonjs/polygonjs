import {BaseCoreLogger} from "./Base";
export class ConsoleLogger extends BaseCoreLogger {
  log(message, ...optionalParams) {
    console.log(...[message, ...optionalParams]);
  }
  warn(...args) {
    console.warn(...args);
  }
  error(...args) {
    console.error(...args);
  }
}
