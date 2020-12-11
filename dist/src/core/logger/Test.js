import {BaseCoreLogger} from "./Base";
export class TestLogger extends BaseCoreLogger {
  constructor() {
    super(...arguments);
    this._lines = [];
  }
  log(message, ...optionalParams) {
    this._lines.push(message);
    if (optionalParams.length > 1) {
      this._lines.push(message);
    } else {
      this._lines.push(optionalParams[0]);
    }
  }
  lines() {
    return this._lines;
  }
}
