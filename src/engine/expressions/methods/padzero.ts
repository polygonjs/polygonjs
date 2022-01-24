/**
 * adds the character 0 at the beginning of a workd
 *
 * @remarks
 * It takes 2 arguments.
 *
 * padzero(<count\>, <word_or_number\>)
 *
 * - **<count\>** - number of character the word will have
 * - **<word_or_number\>** start of the word
 *
 * ## Usage
 *
 * - `padzero(4, 5)` - returns '0005'
 *
 */
import {BaseMethod} from './_Base';

export class PadzeroExpression extends BaseMethod {
	static override requiredArguments() {
		return [['string', 'number']];
	}

	override processArguments(args: any[]): Promise<string> {
		return new Promise((resolve) => {
			const pad: number = args[0] || 2;
			const src_number: number = args[1] || 0;
			const unpadded = `${src_number}`;
			const padded = unpadded.padStart(pad, '0');
			resolve(padded);
		});
	}
}
