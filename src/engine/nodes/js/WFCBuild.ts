/**
 * Update the WFC Build
 *
 *
 */

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

enum WFCBuildJsNodeInput {
	SOLVER_OBJECT = 'solverObject',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class WFCBuildJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new WFCBuildJsParamsConfig();

export class WFCBuildJsNode extends BaseTriggerAndObjectJsNode<WFCBuildJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.WFC_BUILD;
	}
	protected override _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint(
				WFCBuildJsNodeInput.SOLVER_OBJECT,
				JsConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		];
	}
	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint(
				WFCBuildJsNodeInput.SOLVER_OBJECT,
				JsConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		];
	}

	// override setLines(linesController: JsLinesCollectionController) {
	// 	super.setLines(linesController);

	// 	vector3OutputFromParam(this, this.p.position, linesController);
	// 	floatOutputFromParam(this, this.p.lerp, linesController);
	// 	booleanOutputFromParam(this, this.p.updateMatrix, linesController);
	// }

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const solverObject = this.variableForInput(linesController, WFCBuildJsNodeInput.SOLVER_OBJECT);

		const func = Poly.namedFunctionsRegister.getFunction('WFCBuild', this, linesController);
		const bodyLine = func.asString(object3D, solverObject);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
