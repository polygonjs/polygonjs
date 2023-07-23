/**
 * Update the object rotation
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {
	floatOutputFromParam,
	inputObject3D,
	inputPointIndex,
	integerOutputFromParam,
	vector4OutputFromInput,
	setObject3DOutputLine,
} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {JsType} from '../../poly/registers/nodes/types/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetInstanceQuaternionJsParamsConfig extends NodeParamsConfig {
	/** @param point index */
	ptnum = ParamConfig.INTEGER(0);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetInstanceQuaternionJsParamsConfig();

export class SetInstanceQuaternionJsNode extends TypedJsNode<SetInstanceQuaternionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SET_INSTANCE_QUATERNION;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint('ptnum', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.QUATERNION,
				JsConnectionPointType.QUATERNION,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint('ptnum', JsConnectionPointType.INT, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.QUATERNION, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint('lerp', JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);

		integerOutputFromParam(this, this.p.ptnum, linesController);
		vector4OutputFromInput(this, JsConnectionPointType.QUATERNION, linesController);
		floatOutputFromParam(this, this.p.lerp, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const ptnum = inputPointIndex(this, linesController);
		const quaternion = this.variableForInput(linesController, JsConnectionPointType.QUATERNION);
		const lerp = this.variableForInputParam(linesController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction('setPointInstanceQuaternion', this, linesController);
		const bodyLine = func.asString(object3D, ptnum, quaternion, lerp);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
