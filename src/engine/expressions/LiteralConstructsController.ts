export type LiteralConstructMethod = (args: any[]) => string;

export class LiteralConstructsController {
	static if(args: any[]): string {
		const condition = args[0];
		const valTrue = args[1];
		const valFalse = args[2];
		// return `(await (async function (condition){ console.log('condition:',condition);if( condition ){ return (${valTrue}) } else { return (${valFalse}) } })((${condition})))`;

		// return `(await (async function(){
		// 	const condition = (${condition});
		// 	console.log('condition:',condition)
		// 	if(condition){
		// 		return (${valTrue});
		// 	} else {
		// 		return (${valFalse});
		// 	}
		// })())`;

		return `((${condition}) ? (${valTrue}) : (${valFalse}))`;
	}
}
