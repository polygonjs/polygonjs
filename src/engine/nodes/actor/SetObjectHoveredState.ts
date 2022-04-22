// /**
//  * updates an object hovered attribute if the cursor intersects with it
//  *
//  *
//  */

// import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {
// 	ActorConnectionPoint,
// 	ActorConnectionPointType,
// 	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
// } from '../utils/io/connections/Actor';
// import {ActorType} from '../../poly/registers/nodes/types/Actor';
// import {Intersection} from 'three';
// import {BaseNodeType} from '../_Base';
// import {isBooleanTrue} from '../../../core/Type';
// import {CoreObject} from '../../../core/geometry/Object';
// import {ObjectAttribute} from '../../../core/geometry/Attribute';
// import {BaseUserInputActorNode} from './_BaseUserInput';

// const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

// class SetObjectHoveredStateActorParamsConfig extends NodeParamsConfig {
// 	/** @param include children */
// 	traverseChildren = ParamConfig.BOOLEAN(1);
// 	/** @param pointsThreshold */
// 	pointsThreshold = ParamConfig.FLOAT(0.1, {
// 		callback: (node: BaseNodeType) => {
// 			SetObjectHoveredStateActorNode.PARAM_CALLBACK_updateRaycast(node as SetObjectHoveredStateActorNode);
// 		},
// 	});
// 	/** @param lineThreshold */
// 	lineThreshold = ParamConfig.FLOAT(0.1, {
// 		callback: (node: BaseNodeType) => {
// 			SetObjectHoveredStateActorNode.PARAM_CALLBACK_updateRaycast(node as SetObjectHoveredStateActorNode);
// 		},
// 	});
// }
// const ParamsConfig = new SetObjectHoveredStateActorParamsConfig();

// export class SetObjectHoveredStateActorNode extends BaseUserInputActorNode<SetObjectHoveredStateActorParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	private _raycastNeedsUpdated = true;
// 	private _raycastUpdatedOnFrame = -1;
// 	private _intersections: Intersection[] = [];
// 	static override type() {
// 		return ActorType.SET_OBJECT_HOVERED_STATE;
// 	}
// 	userInputEventNames() {
// 		return ['pointermove'];
// 	}

// 	override initializeNode() {
// 		super.initializeNode();
// 		this.io.inputs.setNamedInputConnectionPoints([
// 			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
// 		]);
// 		this.io.connection_points.spare_params.setInputlessParamNames(['pointsThreshold', 'lineThreshold']);
// 	}

// 	public override receiveTrigger(context: ActorNodeTriggerContext): void {
// 		const pointerEventsController = this.scene().eventsDispatcher.pointerEventsController;
// 		const raycaster = pointerEventsController.raycaster();
// 		// const camera = pointerEventsController.camera();
// 		// if (!camera) {
// 		// 	// console.warn('no camera found', this.path(), pointerEventsController.cursor());
// 		// 	return;
// 		// }

// 		const frame = this.scene().frame();
// 		if (this._raycastUpdatedOnFrame != frame) {
// 			this._raycastUpdatedOnFrame = frame;
// 			this._updateRaycast();
// 		}

// 		const {Object3D} = context;
// 		this._intersections.length = 0;
// 		const intersections = raycaster.intersectObject(
// 			Object3D,
// 			isBooleanTrue(this.pv.traverseChildren),
// 			this._intersections
// 		);
// 		const intersection = intersections[0];
// 		CoreObject.addAttribute(Object3D, ObjectAttribute.HOVERED, intersection != null);
// 	}

// 	static PARAM_CALLBACK_updateRaycast(node: SetObjectHoveredStateActorNode) {
// 		node._raycastNeedsUpdated = true;
// 		node._updateRaycast();
// 	}
// 	private _updateRaycast() {
// 		if (!this._raycastNeedsUpdated) {
// 			return;
// 		}
// 		this.scene().eventsDispatcher.pointerEventsController.updateRaycast(this.pv);
// 	}
// }
