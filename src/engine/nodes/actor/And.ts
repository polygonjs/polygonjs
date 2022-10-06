/**
 * performs an AND logical operation between the inputs
 *
 *
 *
 */
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorNodeTriggerContext} from './_Base';
import {BaseLogicOperationActorNode} from './_BaseLogicOperation';

export class AndActorNode extends BaseLogicOperationActorNode {
	static override type() {
		return 'and';
	}

	public override outputValue(context: ActorNodeTriggerContext) {
		const booleanArray = this._inputValue<ActorConnectionPointType.BOOLEAN_ARRAY>(
			this._expectedInputName(0),
			context
		);
		let result = booleanArray ? booleanArray[0] || false : false;
		if (booleanArray && booleanArray.length > 1) {
			for (let elem of booleanArray) {
				result = result && elem;
			}
		}
		return result;
	}
}
