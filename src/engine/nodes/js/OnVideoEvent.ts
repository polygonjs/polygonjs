/**
 * sends a trigger when a video emits an event
 *
 *
 */

import {BaseJsNodeType, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeContext} from '../../poly/NodeContext';
import {CopType} from '../../poly/registers/nodes/types/Cop';
// import {VideoCopNode} from '../cop/Video';
import {JsType} from '../../poly/registers/nodes/types/Js';
// import {objectsForJsNode} from '../../scene/utils/actors/JssManagerUtils';
// import {Object3D} from 'three';
import {
	VideoEvent,
	// VideoEvent,
	VIDEO_EVENTS,
	//   VIDEO_EVENT_INDICES
} from '../../../core/VideoEvent';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {
	getConnectedOutputNodes,
	getOutputIndices,
	nodeMethodName,
	triggerInputIndex,
} from './code/assemblers/actor/ActorAssemblerUtils';
import {SetUtils} from '../../../core/SetUtils';
import {Poly} from '../../Poly';
import {InitFunctionJsDefinition, TriggeringJsDefinition} from './utils/JsDefinition';
import {EvaluatorMethodName} from './code/assemblers/actor/Evaluator';

// type Listener = () => void;
// type Listeners = Record<VideoEvent, Listener>;

class OnVideoEventJsParamsConfig extends NodeParamsConfig {
	/** @param video node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
			types: [CopType.VIDEO],
		},
		computeOnDirty: true,
	});
}
const ParamsConfig = new OnVideoEventJsParamsConfig();

export class OnVideoEventJsNode extends TypedJsNode<OnVideoEventJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): JsType.ON_VIDEO_EVENT {
		return JsType.ON_VIDEO_EVENT;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints(
			VIDEO_EVENTS.map((triggerName) => new JsConnectionPoint(triggerName, JsConnectionPointType.TRIGGER))
		);
	}
	override setTriggeringLines(
		shadersCollectionController: JsLinesCollectionController,
		triggeredMethods: string
	): void {
		const node = this.pv.node.node();
		if (!(node && node.context() == NodeContext.COP)) {
			return;
		}
		const nodePath = `'${node.path()}'`;
		const listeners: Record<VideoEvent, string> = {
			[VideoEvent.PAUSE]: '',
			[VideoEvent.PLAY]: '',
			[VideoEvent.TIME_UPDATE]: '',
			[VideoEvent.VOLUME_CHANGE]: '',
		};
		VIDEO_EVENTS.forEach((videoEvent) => {
			const triggeredMethods = triggerMethod(this, videoEvent);

			const _nodeMethodName = nodeMethodName(this, videoEvent);
			listeners[videoEvent] = `this.${_nodeMethodName}.bind(this)`;

			// const gatherable = options?.gatherable != null ? options.gatherable : false;
			// const triggeringMethodName =
			// 	options?.triggeringMethodName != null ? options.triggeringMethodName : (node.type() as EvaluatorMethodName);

			const value = triggeredMethods; //triggeringLines.join('\n');//
			// const varName = videoEvent; //nodeMethodName(node); //.wrappedBodyLinesMethodName();
			const dataType = JsConnectionPointType.BOOLEAN; // unused
			// if (!EVALUATOR_METHOD_NAMES.includes(triggeringMethodName as EvaluatorMethodName)) {
			// 	console.warn(`method '${triggeringMethodName}' is not included`);
			// }
			shadersCollectionController.addDefinitions(this, [
				new TriggeringJsDefinition(this, shadersCollectionController, dataType, _nodeMethodName, value, {
					triggeringMethodName: videoEvent as any as EvaluatorMethodName,
					gatherable: false,
					nodeMethodName: _nodeMethodName,
				}),
			]);
		});

		const func = Poly.namedFunctionsRegister.getFunction(
			'addVideoEventListener',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(nodePath, JSON.stringify(listeners).replace(/\"/g, ''), `this`);
		shadersCollectionController.addDefinitions(this, [
			new InitFunctionJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.OBJECT_3D,
				this.path(),
				bodyLine
			),
		]);

		// shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {gatherable: false});
	}
}

function triggerMethod(node: OnVideoEventJsNode, outputName: string): string {
	const outputIndex = getOutputIndices(node, (c) => c.name() == outputName)[0];
	const triggerableNodes = new Set<BaseJsNodeType>();
	getConnectedOutputNodes({
		node,
		triggerOutputIndices: [outputIndex],
		triggerableNodes,
		recursive: false,
	});
	const triggerableMethodNames = SetUtils.toArray(triggerableNodes).map((triggerableNode) => {
		const argIndex = triggerInputIndex(node, triggerableNode);
		const m = nodeMethodName(triggerableNode);
		return `this.${m}(${argIndex})`;
	});
	return `${triggerableMethodNames.join(';')}`;
}
