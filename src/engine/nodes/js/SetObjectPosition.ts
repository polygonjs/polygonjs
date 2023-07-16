/**
 * Update the object position
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {Poly} from '../../Poly';
import {inputObject3D, vector3OutputFromParam, floatOutputFromParam, booleanOutputFromParam} from './_BaseObject3D';
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class SetObjectPositionJsParamsConfig extends NodeParamsConfig {
	/** @param target position */
	position = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
	/** @param sets if the matrix should be updated as the animation progresses */
	updateMatrix = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SetObjectPositionJsParamsConfig();

export class SetObjectPositionJsNode extends BaseTriggerAndObjectJsNode<SetObjectPositionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_OBJECT_POSITION;
	}

	protected override _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [
			new JsConnectionPoint('position', JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint('updateMatrix', JsConnectionPointType.BOOLEAN, CONNECTION_OPTIONS),
		];
	}

	override setLines(linesController: JsLinesCollectionController) {
		super.setLines(linesController);

		vector3OutputFromParam(this, this.p.position, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
		booleanOutputFromParam(this, this.p.updateMatrix, linesController);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);
		const updateMatrix = this.variableForInputParam(shadersCollectionController, this.p.updateMatrix);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectPosition', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, position, lerp, updateMatrix);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
