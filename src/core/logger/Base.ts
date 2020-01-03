export class CoreLoggerBase {
	log(message: string) {
		const args = Array.from(message)
		if (args.length > 1) {
			// COMMENT NEXT LINE WHEN EXPORTING FOR ACTIVEDESIGN
			console.log(args)
		} else {
			// COMMENT NEXT LINE WHEN EXPORTING FOR ACTIVEDESIGN
			console.log(args[0])
		}
	}
}
