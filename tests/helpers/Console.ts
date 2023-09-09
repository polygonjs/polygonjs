import {Poly} from '../../src/engine/Poly';

type Callback = () => void;
interface ConsoleHistory {
	log: any[];
	warn: any[];
	error: any[];
}
interface PreservedConsole {
	log: (...data: any[]) => void;
	warn: (...data: any[]) => void;
	error: (...data: any[]) => void;
}
const DO_OVERRIDE = true;
function overrideConsole() {
	const originalConsole: PreservedConsole = {
		log: console.log,
		warn: console.warn,
		error: console.error,
	};

	const consoleHistory: ConsoleHistory = {
		log: [],
		warn: [],
		error: [],
	};

	if (DO_OVERRIDE) {
		console.log = function () {
			consoleHistory.log.push(arguments);
			// originalConsole.log.apply(window.console, arguments as any);
		};
		console.warn = function () {
			consoleHistory.warn.push(arguments);
			// originalConsole.warn.apply(window.console, arguments as any);
		};
		console.error = function () {
			consoleHistory.error.push(arguments);
			// originalConsole.error.apply(window.console, arguments as any);
		};
	}

	return {originalConsole, consoleHistory};
}
function restoreConsole(originalConsole: PreservedConsole) {
	console.log = originalConsole.log;
	console.warn = originalConsole.warn;
	console.error = originalConsole.error;
}
export async function checkConsolePrints(callback: Callback) {
	// save logger state
	const previousLogger = Poly.logger();
	const {originalConsole, consoleHistory} = overrideConsole();
	Poly.setLogger(originalConsole);

	// run
	await callback();

	// restore
	Poly.setLogger(previousLogger);
	restoreConsole(originalConsole);

	return consoleHistory;
}
