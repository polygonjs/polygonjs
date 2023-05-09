/**
 * performs an AND logical operation between the inputs
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {BaseLogicOperationJsNode, AllowedType} from './_BaseLogicOperation';

export class AndJsNode extends BaseLogicOperationJsNode {
	static override type() {
		return 'and';
	}
	protected _expectedOutputName() {
		return 'and';
	}
	protected _functionName(firstType: AllowedType) {
		return firstType == JsConnectionPointType.BOOLEAN ? 'andBooleans' : 'andArrays';
	}
}
