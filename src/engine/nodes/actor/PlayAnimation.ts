/**
 * updates an object hovered attribute if the cursor intersects with it
 *
 *
 */

import {ActorNodeTriggerContext, BaseActorNodeType, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {NodeContext} from '../../poly/NodeContext';
import {AnimPropertyTarget} from '../../../core/animation/PropertyTarget';
import gsap from 'gsap';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};
export enum AnimationActorOutput {
	START = 'start',
	COMPLETE = 'completed',
}

class PlayAnimationActorParamsConfig extends NodeParamsConfig {
	/** @param include children */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {context: NodeContext.ANIM},
		dependentOnFoundNode: false,
	});
}
const ParamsConfig = new PlayAnimationActorParamsConfig();

export class PlayAnimationActorNode extends TypedActorNode<PlayAnimationActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playAnimation';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(AnimationActorOutput.START, ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint(AnimationActorOutput.COMPLETE, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override async receiveTrigger(context: ActorNodeTriggerContext): Promise<void> {
		const param = this.p.node;
		if (param.isDirty()) {
			await param.compute();
		}
		const node = param.value.nodeWithContext(NodeContext.ANIM);
		if (!node) {
			return;
		}
		const container = await node.compute();
		if (!container) {
			return;
		}
		const timelineBuilder = container.coreContent();
		if (!timelineBuilder) {
			return;
		}
		// previously created timeline cannot be killed,
		// since it most likely would have been applied to a different object
		// if (this._timeline && isBooleanTrue(this.pv.stopsPreviousAnim)) {
		// 	this._timeline.kill();
		// }
		const timeline = gsap.timeline();

		const propertyTarget = new AnimPropertyTarget(this.scene(), {object: {list: [context.Object3D]}});
		timelineBuilder.populate(timeline, {registerproperties: true, propertyTarget: propertyTarget});
		timeline.vars.onStart = () => {
			this._triggerAnimationStarted(context);
		};
		timeline.vars.onComplete = () => {
			this._triggerAnimationCompleted(context);
		};
	}

	private _triggerAnimationStarted(context: ActorNodeTriggerContext) {
		const triggerConnections = this.io.connections.outputConnectionsByOutputIndex(0);
		if (!triggerConnections) {
			return;
		}
		triggerConnections.forEach((triggerConnection) => {
			const node = triggerConnection.node_dest as BaseActorNodeType;
			node.receiveTrigger(context);
		});
	}
	private _triggerAnimationCompleted(context: ActorNodeTriggerContext) {
		const triggerConnections = this.io.connections.outputConnectionsByOutputIndex(1);
		if (!triggerConnections) {
			return;
		}
		triggerConnections.forEach((triggerConnection) => {
			const node = triggerConnection.node_dest as BaseActorNodeType;
			node.receiveTrigger(context);
		});
	}
}
