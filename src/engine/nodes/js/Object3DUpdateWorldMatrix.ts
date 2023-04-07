/**
 * updates the matrix of an object
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class Object3DUpdateWorldMatrixJsParamsConfig extends NodeParamsConfig {
	/** @param updates the matrix of the parents */
	updateParents = ParamConfig.BOOLEAN(1);
	/** @param updates the matrix of the children */
	updateChildren = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new Object3DUpdateWorldMatrixJsParamsConfig();

export class Object3DUpdateWorldMatrixJsNode extends TypedJsNode<Object3DUpdateWorldMatrixJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'object3DUpdateWorldMatrix';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const updateParents = this.variableForInputParam(shadersCollectionController, this.p.updateParents);
		const updateChildren = this.variableForInputParam(shadersCollectionController, this.p.updateChildren);

		const func = Poly.namedFunctionsRegister.getFunction(
			'objectUpdateWorldMatrix',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, updateParents, updateChildren);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
