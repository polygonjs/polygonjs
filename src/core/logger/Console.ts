import {BaseCoreLogger} from './Base';

export class ConsoleLogger extends BaseCoreLogger {
	override log(message?: any, ...optionalParams: any[]) {
		console.log(...[message, ...optionalParams]);
	}
	override warn(...args: any) {
		console.warn(...args);
	}
	override error(...args: any) {
		console.error(...args);
	}
}

export function logBlue(message: string) {
	console.log('%c' + message, 'color:blue; font-weight:bold;');
}
export function logDefault(message: string) {
	console.log(message);
}
