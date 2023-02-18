/**
 * Returns false when in the editor, true otherwise
 *
 * @remarks
 *
 * This expression does not take any argument
 *
 * `playerMode()`
 *
 * ## Usage
 *
 * - `playerMode()` - returns false when evaluated from inside the editor, true otherwise
 *
 */
import {BaseMethod} from './_Base';
import {Poly} from '../../Poly';

export class PlayerModeExpression extends BaseMethod {
	static override requiredArguments() {
		return [];
	}

	override async processArguments(args: any[]): Promise<any> {
		return Poly.playerMode();
	}
}
