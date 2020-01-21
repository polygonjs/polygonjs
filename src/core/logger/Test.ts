import {CoreLoggerBase} from './Base';

export class CoreLoggerTest extends CoreLoggerBase {
	_lines: any[] = [];

	log(...args: any[]) {
		if (args.length > 1) {
			this._lines.push(args);
		} else {
			this._lines.push(args[0]);
		}
	}
	lines() {
		return this._lines;
	}
}
