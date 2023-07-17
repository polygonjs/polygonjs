/**
 * Update the object position
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {
	inputObject3D,
	inputPointIndex,
	vector3OutputFromParam,
	floatOutputFromParam,
	integerOutputFromParam,
} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetPointPositionJsParamsConfig extends NodeParamsConfig {
	/** @param point index */
	ptnum = ParamConfig.INTEGER(0);
	/** @param target position */
	position = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetPointPositionJsParamsConfig();

export class SetPointPositionJsNode extends BaseTriggerAndObjectJsNode<SetPointPositionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_POINT_POSITION;
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('ptnum', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('position', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		integerOutputFromParam(this, this.p.ptnum, linesController);
		vector3OutputFromParam(this, this.p.position, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);
		const position = this.variableForInputParam(linesController, this.p.position);
		const lerp = this.variableForInputParam(linesController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction('setPointPosition', this, linesController);
		const bodyLine = func.asString(object3D, ptnum, position, lerp);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
