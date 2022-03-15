/**
 * updates an object hovered attribute if the cursor intersects with it
 *
 *
 */

import {ActorNodeTriggerContext, BaseActorNodeType, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {Raycaster, Intersection} from 'three/src/core/Raycaster';
import {RaycasterForBVH} from '../../operations/sop/utils/Bvh/three-mesh-bvh';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';
import {CoreObject} from '../../../core/geometry/Object';
import {ObjectAttribute} from '../../../core/geometry/Attribute';

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};

function createRaycaster() {
	const raycaster = new Raycaster() as RaycasterForBVH;
	raycaster.firstHitOnly = true;
	return raycaster;
}

class SetHoveredStateActorParamsConfig extends NodeParamsConfig {
	/** @param include children */
	traverseChildren = ParamConfig.BOOLEAN(1);
	/** @param pointsThreshold */
	pointsThreshold = ParamConfig.FLOAT(0.1, {
		callback: (node: BaseNodeType) => {
			SetHoveredStateActorNode.PARAM_CALLBACK_updateRaycast(node as SetHoveredStateActorNode);
		},
	});
	/** @param lineThreshold */
	lineThreshold = ParamConfig.FLOAT(0.1, {
		callback: (node: BaseNodeType) => {
			SetHoveredStateActorNode.PARAM_CALLBACK_updateRaycast(node as SetHoveredStateActorNode);
		},
	});
}
const ParamsConfig = new SetHoveredStateActorParamsConfig();

export class SetHoveredStateActorNode extends TypedActorNode<SetHoveredStateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	private _raycaster = createRaycaster();
	private _raycastNeedsUpdated = true;
	private _raycastUpdatedOnFrame = -1;
	private _intersections: Intersection[] = [];
	static override type() {
		return ActorType.SET_HOVERED_STATE;
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

		// TODO: do not run setFromCamera for every object if camera and cursor have not changed
		// or: if scene is playing, check the frame it was last done
		// if scene is NOT playing, check the renderId it was last done (renderId not yet being implemented)
		// or maybe check renderId in both cases?
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

	override runTrigger(context: ActorNodeTriggerContext) {
		const triggerConnections = this.io.connections.outputConnectionsByOutputIndex(0);
		if (!triggerConnections) {
			return;
		}
		triggerConnections.forEach((triggerConnection) => {
			const node = triggerConnection.node_dest as BaseActorNodeType;
			node.receiveTrigger(context);
		});
	}

	static PARAM_CALLBACK_updateRaycast(node: SetHoveredStateActorNode) {
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
