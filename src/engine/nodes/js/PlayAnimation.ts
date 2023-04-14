/**
 * starts an animation
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {NodeContext} from '../../poly/NodeContext';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
export enum AnimationJsOutput {
	START = 'start',
	COMPLETE = 'completed',
}

class PlayAnimationJsParamsConfig extends NodeParamsConfig {
	/** @param include children */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {context: NodeContext.ANIM},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new PlayAnimationJsParamsConfig();

export class PlayAnimationJsNode extends TypedJsNode<PlayAnimationJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playAnimation';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(AnimationJsOutput.START, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(AnimationJsOutput.COMPLETE, JsConnectionPointType.TRIGGER),
		]);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const node = this.pv.node.node();
		if (!node) {
			return;
		}
		const nodePath = `'${node.path()}'`;

		const func = Poly.namedFunctionsRegister.getFunction('playAnimation', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, nodePath);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
