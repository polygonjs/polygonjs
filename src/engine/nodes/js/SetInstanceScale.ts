/**
 * Update the object scale
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {
	integerOutputFromParam,
	floatOutputFromParam,
	inputObject3D,
	inputPointIndex,
	vector3OutputFromParam,
} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JsType} from '../../poly/registers/nodes/types/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetInstanceScaleJsParamsConfig extends NodeParamsConfig {
	/** @param point index */
	ptnum = ParamConfig.INTEGER(0);
	/** @param target scale */
	scale = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param target scale */
	mult = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [false, false],
	});
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetInstanceScaleJsParamsConfig();

export class SetInstanceScaleJsNode extends BaseTriggerAndObjectJsNode<SetInstanceScaleJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_INSTANCE_SCALE;
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('ptnum', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint('scale', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('mult', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		integerOutputFromParam(this, this.p.ptnum, linesController);
		vector3OutputFromParam(this, this.p.scale, linesController);
		floatOutputFromParam(this, this.p.mult, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);
		const scale = this.variableForInputParam(linesController, this.p.scale);
		const mult = this.variableForInputParam(linesController, this.p.mult);
		const lerp = this.variableForInputParam(linesController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction('setPointInstanceScale', this, linesController);
		const bodyLine = func.asString(object3D, ptnum, scale, mult, lerp);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
