/**
 * Update the object scale
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {booleanOutputFromParam, floatOutputFromParam, inputObject3D, vector3OutputFromParam} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectScaleJsParamsConfig extends NodeParamsConfig {
	/** @param target scale */
	scale = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param target scale */
	mult = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [false, false],
	});
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectScaleJsParamsConfig();

export class SetObjectScaleJsNode extends BaseTriggerAndObjectJsNode<SetObjectScaleJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectScale';
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('scale', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('mult', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint('updateMatrix', JsConnectionPointType.BOOLEAN, CONNECTION_OPTIONS),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		vector3OutputFromParam(this, this.p.scale, linesController);
		floatOutputFromParam(this, this.p.mult, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
		booleanOutputFromParam(this, this.p.updateMatrix, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const scale = this.variableForInputParam(linesController, this.p.scale);
		const mult = this.variableForInputParam(linesController, this.p.mult);
		const lerp = this.variableForInputParam(linesController, this.p.lerp);
		const updateMatrix = this.variableForInputParam(linesController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectScale', this, linesController);
		const bodyLine = func.asString(object3D, scale, mult, lerp, updateMatrix);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
