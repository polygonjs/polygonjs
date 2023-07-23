/**
 * Make object look at a position
 *
 *
 */

import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {
	floatOutputFromParam,
	inputObject3D,
	inputPointIndex,
	integerOutputFromParam,
	vector3OutputFromParam,
} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetInstanceLookAtJsParamsConfig extends NodeParamsConfig {
	/** @param point index */
	ptnum = ParamConfig.INTEGER(0);
	/** @param target position */
	targetPosition = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param up */
	up = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetInstanceLookAtJsParamsConfig();

export class SetInstanceLookAtJsNode extends BaseTriggerAndObjectJsNode<SetInstanceLookAtJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_INSTANCE_LOOK_AT;
	}
	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('ptnum', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('targetPosition', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('up', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		];
	}
	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		integerOutputFromParam(this, this.p.ptnum, linesController);
		vector3OutputFromParam(this, this.p.targetPosition, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);
		const targetPosition = this.variableForInputParam(linesController, this.p.targetPosition);
		const up = this.variableForInputParam(linesController, this.p.up);
		const lerp = this.variableForInputParam(linesController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction('setPointInstanceLookAt', this, linesController);
		const bodyLine = func.asString(object3D, ptnum, targetPosition, up, lerp);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
