/**
 * dispatches an event
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
class ObjectDispatchEventJsParamsConfig extends NodeParamsConfig {
	/** @param event name */
	eventName = ParamConfig.STRING('my-event');
}
const ParamsConfig = new ObjectDispatchEventJsParamsConfig();

export class ObjectDispatchEventJsNode extends TypedJsNode<ObjectDispatchEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'objectDispatchEvent';
	}

	override initializeNode() {
		super.initializeNode();
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
		const eventName = this.variableForInputParam(shadersCollectionController, this.p.eventName);

		const func = Poly.namedFunctionsRegister.getFunction('objectDispatchEvent', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, eventName);
		// shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
