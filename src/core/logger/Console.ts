import {BaseCoreLogger} from './Base';

export class ConsoleLogger extends BaseCoreLogger {
	log(message?: any, ...optionalParams: any[]) {
		console.log(...[message, ...optionalParams]);
	}
	warn(...args: any) {
		console.warn(...args);
	}
	error(...args: any) {
		console.error(...args);
	}
}
