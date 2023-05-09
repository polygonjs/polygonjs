/**
 * performs an OR logical operation between the inputs
 *
 *
 *
 */
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {BaseLogicOperationJsNode, AllowedType} from './_BaseLogicOperation';

export class OrJsNode extends BaseLogicOperationJsNode {
	static override type() {
		return 'or';
	}
	protected _expectedOutputName() {
		return 'or';
	}
	protected _functionName(firstType: AllowedType) {
		return firstType == JsConnectionPointType.BOOLEAN ? 'orBooleans' : 'orArrays';
	}
}
