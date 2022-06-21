/**
 * sends a trigger when the viewer taps or clicks on an object
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {BaseUserInputActorNode} from './_BaseUserInput';
import {isBooleanTrue} from '../../../core/Type';
import {Intersection} from 'three';
import {CoreEventEmitter, EVENT_EMITTERS, EVENT_EMITTER_PARAM_MENU_OPTIONS} from '../../../core/event/CoreEventEmitter';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectPointerdownActorParamsConfig extends NodeParamsConfig {
	/** @param set which element triggers the event */
	element = ParamConfig.INTEGER(EVENT_EMITTERS.indexOf(CoreEventEmitter.CANVAS), {
		...EVENT_EMITTER_PARAM_MENU_OPTIONS,
		separatorAfter: true,
	});
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1);
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new OnObjectPointerdownActorParamsConfig();

export class OnObjectPointerdownActorNode extends BaseUserInputActorNode<OnObjectPointerdownActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_OBJECT_POINTERDOWN;
	}
	userInputEventNames() {
		return ['pointerdown'];
	}
	override eventEmitter() {
		return EVENT_EMITTERS[this.pv.element];
	}
	private _intersections: Intersection[] = [];

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold', 'element']);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const {Object3D} = context;

		const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
		const raycaster = pointerEventsController.raycaster();
		pointerEventsController.updateRaycast(this.pv);

		this._intersections.length = 0;
		const intersections = raycaster.intersectObject(
			Object3D,
			isBooleanTrue(this.pv.traverseChildren),
			this._intersections
		);
		const intersection = intersections[0];
		if (intersection) {
			this.runTrigger(context);
		}
	}
}
