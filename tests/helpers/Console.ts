type Callback = () => void;
interface ConsoleHistory {
	log: any[];
	warn: any[];
	error: any[];
}
export async function checkConsolePrints(callback: Callback) {
	// Save original console methods
	var originalConsole = {
		log: console.log,
		warn: console.warn,
		error: console.error,
	};

	const consoleHistory: ConsoleHistory = {
		log: [],
		warn: [],
		error: [],
	};

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
	await callback();
	console.log = originalConsole.log;
	console.warn = originalConsole.warn;
	console.error = originalConsole.error;
	return consoleHistory;
}
