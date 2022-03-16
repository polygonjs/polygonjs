/**
 * updates an object hovered attribute if the cursor intersects with it
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {Raycaster, Intersection} from 'three/src/core/Raycaster';
import {RaycasterForBVH} from '../../operations/sop/utils/Bvh/three-mesh-bvh';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';
import {CoreObject} from '../../../core/geometry/Object';
import {ObjectAttribute} from '../../../core/geometry/Attribute';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

function createRaycaster() {
	const raycaster = new Raycaster() as RaycasterForBVH;
	raycaster.firstHitOnly = true;
	return raycaster;
}

class SetObjectHoveredStateActorParamsConfig extends NodeParamsConfig {
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1, {
		callback: (node: BaseNodeType) => {
			SetObjectHoveredStateActorNode.PARAM_CALLBACK_updateRaycast(node as SetObjectHoveredStateActorNode);
		},
	});
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1, {
		callback: (node: BaseNodeType) => {
			SetObjectHoveredStateActorNode.PARAM_CALLBACK_updateRaycast(node as SetObjectHoveredStateActorNode);
		},
	});
}
const ParamsConfig = new SetObjectHoveredStateActorParamsConfig();

export class SetObjectHoveredStateActorNode extends TypedActorNode<SetObjectHoveredStateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	private _raycaster = createRaycaster();
	private _raycastNeedsUpdated = true;
	private _raycastUpdatedOnFrame = -1;
	private _intersections: Intersection[] = [];
	static override type() {
		return ActorType.SET_OBJECT_HOVERED_STATE;
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold']);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext): void {
		const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
		const cursor = pointerEventsController.cursor();
		const camera = pointerEventsController.camera();
		if (!camera) {
			return;
		}

		const frame = this.scene().frame();
		if (this._raycastUpdatedOnFrame != frame) {
			this._raycastUpdatedOnFrame = frame;
			this._updateRaycast();
			this._raycaster.setFromCamera(cursor, camera);
		}

		const {Object3D} = context;
		this._intersections.length = 0;
		const intersections = this._raycaster.intersectObject(
			Object3D,
			isBooleanTrue(this.pv.traverseChildren),
			this._intersections
		);
		const intersection = intersections[0];
		const dict = CoreObject.attributesDictionary(Object3D);
		if (intersection) {
			dict[ObjectAttribute.HOVERED] = true;
		} else {
			dict[ObjectAttribute.HOVERED] = false;
		}
	}

	static PARAM_CALLBACK_updateRaycast(node: SetObjectHoveredStateActorNode) {
		node._raycastNeedsUpdated = true;
		node._updateRaycast();
	}
	private _updateRaycast() {
		if (!this._raycastNeedsUpdated) {
			return;
		}
		const pointsParam = this._raycaster.params.Points;
		if (pointsParam) {
			pointsParam.threshold = this.pv.pointsThreshold;
		}
		const lineParam = this._raycaster.params.Line;
		if (lineParam) {
			lineParam.threshold = this.pv.lineThreshold;
		}
	}
}
