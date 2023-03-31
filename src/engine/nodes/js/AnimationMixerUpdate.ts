/**
 * create an animation mixer from an object that contains animation tracks
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
// import {Object3D} from 'three';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class AnimationMixerUpdateJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new AnimationMixerUpdateJsParamsConfig();

export class AnimationMixerUpdateJsNode extends TypedJsNode<AnimationMixerUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'animationMixerUpdate';
	}

	static readonly OUTPUT_NAME = 'val';
	static readonly INPUT_NAMES = {
		TRIGGER: TRIGGER_CONNECTION_NAME,
		ANIMATION_MIXER: JsConnectionPointType.ANIMATION_MIXER,
	};
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(
				AnimationMixerUpdateJsNode.INPUT_NAMES.TRIGGER,
				JsConnectionPointType.TRIGGER,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				AnimationMixerUpdateJsNode.INPUT_NAMES.ANIMATION_MIXER,
				JsConnectionPointType.ANIMATION_MIXER,
				CONNECTION_OPTIONS
			),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction('animationMixerUpdate', this, shadersCollectionController);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
