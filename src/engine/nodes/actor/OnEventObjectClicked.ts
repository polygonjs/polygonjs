/**
 * sends a trigger when an object is clicked
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
import {Intersection} from 'three/src/core/Raycaster';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class OnEventObjectClickedActorParamsConfig extends NodeParamsConfig {
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1);
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new OnEventObjectClickedActorParamsConfig();

export class OnEventObjectClickedActorNode extends BaseUserInputActorNode<OnEventObjectClickedActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return ActorType.ON_EVENT_OBJECT_CLICKED;
	}
	userInputEventNames() {
		return ['pointerdown'];
	}
	private _intersections: Intersection[] = [];

	override initializeNode() {
		super.initializeNode();
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold']);
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
