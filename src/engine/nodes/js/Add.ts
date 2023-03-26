/**
 * adds 2 inputs together
 *
 *
 */
import {CoreType} from '../../../core/Type';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {MathFunctionArgNOperationFactory} from './_Math_ArgNOperation';

export class AddJsNode extends MathFunctionArgNOperationFactory('add', {
	inputPrefix: 'add',
	out: 'sum',
}) {
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const values: string[] = [];
		const connectionPoints = this.io.inputs.namedInputConnectionPoints();
		for (let connectionPoint of connectionPoints) {
			const connectionPointName = connectionPoint.name();
			const value = this.variableForInput(shadersCollectionController, connectionPointName);
			values.push(value);
		}

		const firstType = this.io.connection_points.first_input_connection_type();
		if (CoreType.isString(firstType) || CoreType.isNumberValid(firstType)) {
			return values.join(' + ');
		}
		if (CoreType.isVector(firstType)) {
			return values.join('.add(') + ')';
		}

		// shadersCollectionController.addBodyOrComputed(
		// 	this,
		// 	JsConnectionPointType.VECTOR3,
		// 	this.jsVarName(GetObjectPropertyJsNodeInputName.position),
		// 	`${EvaluatorConstant}.position`
		// );
	}
}
