/**
 * plays an AnimationAction
 *
 *
 */

import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {TRIGGER_CONNECTION_NAME} from './_Base';
import {TypedJsNode} from './_Base';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class AnimationActionPlayJsParamsConfig extends NodeParamsConfig {
	/** @param manual trigger */
	// trigger = ParamConfig.BUTTON(null, ACTOR_NODE_SELF_TRIGGER_CALLBACK);
}
const ParamsConfig = new AnimationActionPlayJsParamsConfig();

export class AnimationActionPlayJsNode extends TypedJsNode<AnimationActionPlayJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationActionPlay';
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.ANIMATION_ACTION,
				JsConnectionPointType.ANIMATION_ACTION,
				CONNECTION_OPTIONS
			),
		]);
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const action = this.variableForInput(shadersCollectionController, JsConnectionPointType.ANIMATION_ACTION);

		const func = Poly.namedFunctionsRegister.getFunction('animationActionPlay', this, shadersCollectionController);
		const bodyLine = func.asString(action);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
