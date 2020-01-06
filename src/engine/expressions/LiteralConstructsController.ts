export type LiteralConstructMethod = (args: any[]) => string

export class LiteralConstructsController {
	static if(args: any[]): string {
		const condition = args[0]
		const val_true = args[1]
		const val_false = args[2]
		return `(${condition}) ? (${val_true}) : (${val_false})`
	}
}
