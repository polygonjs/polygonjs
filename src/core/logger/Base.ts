export class CoreLoggerBase {
	log(message: string) {
		const args = Array.from(message)
		if (args.length > 1) {
			// COMMENT NEXT LINE WHEN EXPORTING
			console.log(args)
		} else {
			// COMMENT NEXT LINE WHEN EXPORTING
			console.log(args[0])
		}
	}
}
