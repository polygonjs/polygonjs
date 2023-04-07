/**
 * Update the object castShadow state
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

class SetObjectCastShadowJsParamsConfig extends NodeParamsConfig {
	/** @param target castShadow state */
	castShadow = ParamConfig.BOOLEAN(true);
}
const ParamsConfig = new SetObjectCastShadowJsParamsConfig();

export class SetObjectCastShadowJsNode extends TypedJsNode<SetObjectCastShadowJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectCastShadow';
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

	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const castShadow = this.variableForInputParam(shadersCollectionController, this.p.castShadow);

		const func = Poly.namedFunctionsRegister.getFunction('setObjectCastShadow', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, castShadow);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
