import {Object3D} from 'three';
import {TypedNode} from '../../nodes/_Base';
import {BaseActorNodeType} from '../../nodes/actor/_Base';
import {ActorNodeChildrenMap} from '../../poly/registers/nodes/Actor';
import {NodeCreateOptions} from '../../nodes/utils/hierarchy/ChildrenController';
import {AttribValue, Constructor, valueof} from '../../../types/GlobalTypes';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {PolyScene} from '../PolyScene';
import {CoreObject} from '../../../core/geometry/Object';
import {MapUtils} from '../../../core/MapUtils';
import {ActorManualTriggersController} from './actors/ManualTriggersController';
import {NodeContext} from '../../poly/NodeContext';
import {ActorPointerEventsController} from './actors/ActorsPointerEventsController';
import {ActorHoveredEventsController} from './actors/ActorsHoveredEventsController';
import {ActorKeyboardEventsController} from './actors/ActorsKeyboardEventsController';
import {AttributeProxy} from '../../../core/geometry/attribute/_Base';
import {OnScenePlayStateActorNode} from '../../nodes/actor/OnScenePlayState';
import {ActorNodeTriggerContext} from '../../nodes/actor/_Base';

const ACTOR_BUILDER_NODE_IDS_KEY = 'actorBuilderNodeIds';

export class ActorBuilderNode extends TypedNode<any, any> {
	// protected override _childrenControllerContext = NodeContext.ACTOR;
	override createNode<S extends keyof ActorNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): ActorNodeChildrenMap[S];
	override createNode<K extends valueof<ActorNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ActorNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseActorNodeType[];
	}
	override nodesByType<K extends keyof ActorNodeChildrenMap>(type: K): ActorNodeChildrenMap[K][] {
		return super.nodesByType(type) as ActorNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		return true;
	}
}

type ActorNodeToInitOnPlay =
	| ActorType.ON_PERFORMANCE_CHANGE
	| ActorType.ON_OBJECT_DISPATCH_EVENT
	| ActorType.ON_VIDEO_EVENT
	| ActorType.ON_WEBXR_CONTROLLER_EVENT;
const ACTOR_TYPES_TO_INIT_ON_PLAY: Array<ActorNodeToInitOnPlay> = [
	ActorType.ON_PERFORMANCE_CHANGE,
	ActorType.ON_OBJECT_DISPATCH_EVENT,
	ActorType.ON_VIDEO_EVENT,
	ActorType.ON_WEBXR_CONTROLLER_EVENT,
];

export class ActorsManager {
	constructor(public readonly scene: PolyScene) {}

	private _actorNodes: Set<ActorBuilderNode> = new Set();
	private _keyboardEventsController: ActorKeyboardEventsController | undefined;
	private _manualTriggerController: ActorManualTriggersController | undefined;
	private _pointerEventsController: ActorPointerEventsController | undefined;
	private _hoveredEventsController: ActorHoveredEventsController | undefined;
	private _contextByObject: WeakMap<Object3D, ActorNodeTriggerContext> = new WeakMap();

	assignActorBuilder(object: Object3D, node: ActorBuilderNode) {
		let ids = this.objectActorNodeIds(object);
		if (!ids) {
			ids = [];
			object.userData[ACTOR_BUILDER_NODE_IDS_KEY] = ids;
		}
		const id = node.graphNodeId();
		if (!ids.includes(id)) {
			ids.push(id);
		}

		this._actorNodes.add(node);
		// this._findSceneEvents(node);
	}
	objectActorNodeIds(object: Object3D) {
		return object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
	}
	/*
	 *
	 * EVENTS
	 *
	 */
	get keyboardEventsController() {
		return (this._keyboardEventsController =
			this._keyboardEventsController || new ActorKeyboardEventsController(this));
	}
	get manualTriggerController() {
		return (this._manualTriggerController =
			this._manualTriggerController || new ActorManualTriggersController(this));
	}
	get pointerEventsController() {
		return (this._pointerEventsController =
			this._pointerEventsController || new ActorPointerEventsController(this));
	}
	get hoveredEventsController() {
		return (this._hoveredEventsController =
			this._hoveredEventsController || new ActorHoveredEventsController(this));
	}

	/*
	 *
	 * PUBLIC METHODS
	 *
	 */
	tick() {
		this._manualTriggerController?.runTriggers();
		this._pointerEventsController?.runTriggers();
		this._keyboardEventsController?.runTriggers();
		this.hoveredEventsController.runTriggers();
		this._runOnEventTick();
	}
	runOnEventSceneReset() {
		this._onEventSceneResetTraverse();
	}
	runOnEventScenePlay() {
		this._onEventScenePlayTraverse();

		// any caching goes here
		this.scene.perfMonitor.reset();
		for (let type of ACTOR_TYPES_TO_INIT_ON_PLAY) {
			const nodes = this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, type);
			for (let node of nodes) {
				node.initOnPlay();
			}
		}

		this._makeRequiredObjectAttributesReactive();
	}
	runOnEventScenePause() {
		this._onEventScenePauseTraverse();
	}
	runOnEventPerformanceChange() {
		this._onEventPerformanceChangeTraverse();
	}

	/*
	 *
	 * PRIVATE METHODS
	 *
	 */
	private _runOnEventTick() {
		this._onEventTickTraverse();
	}

	// tick
	private _onEventTickBound = this._onEventTick.bind(this);
	private _onEventTick(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_TICK);
	}
	private _onEventTickTraverse() {
		if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_TICK)) {
			return;
		}
		this.scene.threejsScene().traverse(this._onEventTickBound);
	}
	// reset
	private _onEventSceneResetBound = this._onEventSceneReset.bind(this);
	private _onEventSceneReset(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_SCENE_RESET);
	}
	private _onEventSceneResetTraverse() {
		if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_SCENE_RESET)) {
			return;
		}
		this.scene.threejsScene().traverse(this._onEventSceneResetBound);
	}
	// play
	private _onEventScenePlayBound = this._onEventScenePlay.bind(this);
	private _onEventScenePlay(object: Object3D) {
		this._triggerEventNodes(
			object,
			ActorType.ON_SCENE_PLAY_STATE,
			OnScenePlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnScenePlayStateActorNode.OUTPUT_NAME_PLAY)
		);
	}
	private _onEventScenePlayTraverse() {
		if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_SCENE_PLAY_STATE)) {
			return;
		}
		this.scene.threejsScene().traverse(this._onEventScenePlayBound);
	}
	// pause
	private _onEventScenePauseBound = this._onEventScenePause.bind(this);
	private _onEventScenePause(object: Object3D) {
		this._triggerEventNodes(
			object,
			ActorType.ON_SCENE_PLAY_STATE,
			OnScenePlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnScenePlayStateActorNode.OUTPUT_NAME_PAUSE)
		);
	}
	private _onEventScenePauseTraverse() {
		if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_SCENE_PLAY_STATE)) {
			return;
		}
		this.scene.threejsScene().traverse(this._onEventScenePauseBound);
	}
	// performanceChange
	private _onEventPerformanceChangeBound = this._onEventPerformanceChange.bind(this);
	private _onEventPerformanceChange(object: Object3D) {
		const actorType = ActorType.ON_PERFORMANCE_CHANGE;
		const nodeIds = this.objectActorNodeIds(object);
		if (!nodeIds) {
			return;
		}

		for (let nodeId of nodeIds) {
			const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
			if (node) {
				const onEventNodes = node.nodesByType(actorType);
				for (let onEventNode of onEventNodes) {
					let context = this._contextByObject.get(object);
					if (!context) {
						context = {Object3D: object};
						this._contextByObject.set(object, context);
					}
					onEventNode.runTriggerIfRequired(context);
				}
			}
		}
	}
	private _onEventPerformanceChangeTraverse() {
		if (!this.scene.nodesController.hasNodesByContextAndType(NodeContext.ACTOR, ActorType.ON_PERFORMANCE_CHANGE)) {
			return;
		}
		this.scene.threejsScene().traverse(this._onEventPerformanceChangeBound);
	}
	//
	private _triggerEventNodes(object: Object3D, actorType: ActorType, outputIndex: number = 0) {
		const nodeIds = this.objectActorNodeIds(object);
		if (!nodeIds) {
			return;
		}

		for (let nodeId of nodeIds) {
			const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
			if (node) {
				const onEventNodes = node.nodesByType(actorType);
				for (let onEventNode of onEventNodes) {
					let context = this._contextByObject.get(object);
					if (!context) {
						context = {Object3D: object};
						this._contextByObject.set(object, context);
					}
					onEventNode.runTrigger(context, outputIndex);
				}
			}
		}
	}

	// param

	// video
	// onEventVideoPlayTraverse(videoNode: VideoCopNode) {
	// 	if (
	// 		this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, ActorType.ON_VIDEO_PLAY_STATE).length ==
	// 		0
	// 	) {
	// 		return;
	// 	}
	// 	this.scene.threejsScene().traverse((object) => {
	// 		this._triggerVideoEventNodes(
	// 			object,
	// 			videoNode,
	// 			OnVideoPlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnVideoPlayStateActorNode.OUTPUT_NAME_PLAY)
	// 		);
	// 	});
	// }
	// onEventVideoPauseTraverse(videoNode: VideoCopNode) {
	// 	if (
	// 		this.scene.nodesController.nodesByContextAndType(NodeContext.ACTOR, ActorType.ON_VIDEO_PLAY_STATE).length ==
	// 		0
	// 	) {
	// 		return;
	// 	}
	// 	this.scene.threejsScene().traverse((object) => {
	// 		this._triggerVideoEventNodes(
	// 			object,
	// 			videoNode,
	// 			OnVideoPlayStateActorNode.OUTPUT_TRIGGER_NAMES.indexOf(OnVideoPlayStateActorNode.OUTPUT_NAME_PAUSE)
	// 		);
	// 	});
	// }
	// private _triggerVideoEventNodes(object: Object3D, videoNode: VideoCopNode, outputIndex: number = 0) {
	// 	const nodeIds = this.objectActorNodeIds(object);
	// 	if (!nodeIds) {
	// 		return;
	// 	}

	// 	for (let nodeId of nodeIds) {
	// 		const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
	// 		if (node) {
	// 			const onEventNodes = node.nodesByType(ActorType.ON_VIDEO_PLAY_STATE);
	// 			for (let onEventNode of onEventNodes) {
	// 				if (onEventNode.listensToVideoNode(videoNode)) {
	// 					onEventNode.runTrigger({Object3D: object}, outputIndex);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	private _makeRequiredObjectAttributesReactive() {
		this.scene.threejsScene().traverse((object) => {
			const getNodesByAttribName = () => {
				const nodeIds = this.objectActorNodeIds(object);
				if (!nodeIds) {
					return;
				}

				// check nodes listening to this object
				const actorBuilderNodes = nodeIds
					.map((nodeId) => this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
					.filter((node) => node);
				const onEventObjectAttributeUpdatedNodes = actorBuilderNodes
					.map((node) => node.nodesByType(ActorType.ON_OBJECT_ATTRIBUTE_UPDATE))
					.flat();
				const nodesByAttribName = MapUtils.groupBy(onEventObjectAttributeUpdatedNodes, (node) =>
					node.attributeName()
				);
				return nodesByAttribName;
			};

			// check nodes listening to this parent
			const getParentNodesByAttribName = () => {
				const parent = object.parent;
				if (!parent) {
					return;
				}
				const nodeIds = parent.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
				if (!nodeIds) {
					return;
				}

				// check nodes listening to this object
				const actorBuilderNodes = nodeIds
					.map((nodeId) => this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
					.filter((node) => node);
				const onEventChildAttributeUpdatedNodes = actorBuilderNodes
					.map((node) => node.nodesByType(ActorType.ON_CHILD_ATTRIBUTE_UPDATE))
					.flat();
				const nodesByAttribName = MapUtils.groupBy(onEventChildAttributeUpdatedNodes, (node) =>
					node.attributeName()
				);
				return nodesByAttribName;
			};

			const nodesByAttribName = getNodesByAttribName();
			const parentNodesByAttribName = getParentNodesByAttribName();
			if (!(nodesByAttribName || parentNodesByAttribName)) {
				return;
			}
			const reactiveAttributeNames: Set<string> = new Set();
			nodesByAttribName?.forEach((nodes, attributeName) => {
				reactiveAttributeNames.add(attributeName);
			});
			parentNodesByAttribName?.forEach((nodes, attributeName) => {
				reactiveAttributeNames.add(attributeName);
			});
			reactiveAttributeNames.forEach((attributeName) => {
				const directActorNodes = nodesByAttribName?.get(attributeName);
				const parentNodes = parentNodesByAttribName?.get(attributeName);

				// apply callback
				CoreObject.makeAttribReactive<AttribValue>(
					object,
					attributeName,
					(proxy: AttributeProxy<AttribValue>) => {
						// console.log('callback', object);
						// if (proxy.callbackRanAtFrame >= this.scene.frame()) {
						// 	console.log('already reacted at frame', this.scene.frame());
						// 	return;
						// }
						// proxy.callbackRanAtFrame = this.scene.frame();
						let context = this._contextByObject.get(object);
						if (!context) {
							context = {Object3D: object};
							this._contextByObject.set(object, context);
						}

						if (directActorNodes) {
							for (let node of directActorNodes) {
								node.runTrigger(context);
							}
						}
						if (parentNodes) {
							const parent = object.parent;
							if (parent) {
								const parentContext = {Object3D: parent};
								for (let parentNode of parentNodes) {
									parentNode.runTrigger(parentContext);
								}
							}
						}
					}
				);
			});
		});
	}

	parentActorBuilderNode(node: BaseActorNodeType) {
		return node.parentController.findParent((parent) => parent.childrenControllerContext() == NodeContext.ACTOR);
	}
}
