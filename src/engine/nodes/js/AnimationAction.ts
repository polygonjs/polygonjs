/**
 * create an animation action from an animation mixer
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class AnimationActionJsParamsConfig extends NodeParamsConfig {
	clipName = ParamConfig.STRING('');
	autoPlay = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new AnimationActionJsParamsConfig();

export class AnimationActionJsNode extends TypedJsNode<AnimationActionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationAction';
	}

	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(
				JsConnectionPointType.ANIMATION_MIXER,
				JsConnectionPointType.ANIMATION_MIXER,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.ANIMATION_ACTION, JsConnectionPointType.ANIMATION_ACTION),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const mixer = this.variableForInput(shadersCollectionController, JsConnectionPointType.ANIMATION_MIXER);
		const clipName = this.variableForInputParam(shadersCollectionController, this.p.clipName);
		const autoPlay = this.variableForInputParam(shadersCollectionController, this.p.autoPlay);
		const varName = this.jsVarName(JsConnectionPointType.ANIMATION_ACTION);
		const func = Poly.namedFunctionsRegister.getFunction('getAnimationAction', this, shadersCollectionController);

		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(mixer, clipName, autoPlay)},
		]);
	}
}
