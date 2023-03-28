/**
 * Make object look at a position
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectLookAtJsParamsConfig extends NodeParamsConfig {
	/** @param targetPosition */
	targetPosition = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param up */
	up = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param invertDirection */
	invertDirection = ParamConfig.BOOLEAN(0);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectLookAtJsParamsConfig();

export class SetObjectLookAtJsNode extends TypedJsNode<SetObjectLookAtJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_OBJECT_LOOK_AT;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const targetPosition = this.variableForInputParam(shadersCollectionController, this.p.targetPosition);
		const up = this.variableForInputParam(shadersCollectionController, this.p.up);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const invertDirection = this.variableForInputParam(shadersCollectionController, this.p.invertDirection);
		const updateMatrix = this.variableForInputParam(shadersCollectionController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectLookAt', this, shadersCollectionController);
		const bodyLine = func.asString(targetPosition, up, lerp, invertDirection, updateMatrix);
		shadersCollectionController.addBodyLines(this, [bodyLine]);
	}
}
