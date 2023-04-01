/**
 * Update the object matrixAutoUpdate state
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectMatrixAutoUpdateJsParamsConfig extends NodeParamsConfig {
	/** @param target MatrixAutoUpdate state */
	matrixAutoUpdate = ParamConfig.BOOLEAN(true);
}
const ParamsConfig = new SetObjectMatrixAutoUpdateJsParamsConfig();

export class SetObjectMatrixAutoUpdateJsNode extends TypedJsNode<SetObjectMatrixAutoUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectMatrixAutoUpdate';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const matrixAutoUpdate = this.variableForInputParam(shadersCollectionController, this.p.matrixAutoUpdate);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setObjectMatrixAutoUpdate',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, matrixAutoUpdate);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
