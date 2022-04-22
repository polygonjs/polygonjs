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

export class ActorsManager {
	constructor(public readonly scene: PolyScene) {}

	private _actorNodes: Set<ActorBuilderNode> = new Set();
	private _manualTriggerController: ActorManualTriggersController | undefined;
	private _pointerEventsController: ActorPointerEventsController | undefined;
	private _hoveredEventsController: ActorHoveredEventsController | undefined;

	assignActorBuilder(object: Object3D, node: ActorBuilderNode) {
		object.userData[ACTOR_BUILDER_NODE_IDS_KEY] = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] || [];
		object.userData[ACTOR_BUILDER_NODE_IDS_KEY].push(node.graphNodeId());

		this._actorNodes.add(node);
		// this._findSceneEvents(node);
	}

	/*
	 *
	 * MANUAL TRIGGERS
	 *
	 */
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
		this.hoveredEventsController.runTriggers();
		this._runOnEventTick();
	}
	runOnEventSceneReset() {
		this.scene.threejsScene().traverse(this._onEventSceneResetBound);
	}
	runOnEventScenePlay() {
		this.scene.threejsScene().traverse(this._onEventScenePlayBound);

		// any caching goes here
		this._makeRequiredObjectAttributesReactive();
	}
	runOnEventScenePause() {
		this.scene.threejsScene().traverse(this._onEventScenePauseBound);
	}

	/*
	 *
	 * PRIVATE METHODS
	 *
	 */
	private _runOnEventTick() {
		this.scene.threejsScene().traverse(this._onEventTickBound);
	}

	private _onEventTickBound = this._onEventTick.bind(this);
	private _onEventTick(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_TICK);
	}
	private _onEventSceneResetBound = this._onEventSceneReset.bind(this);
	private _onEventSceneReset(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_SCENE_RESET);
	}
	private _onEventScenePlayBound = this._onEventScenePlay.bind(this);
	private _onEventScenePlay(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_SCENE_PLAY_STATE, 0);
	}
	private _onEventScenePauseBound = this._onEventScenePause.bind(this);
	private _onEventScenePause(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_SCENE_PLAY_STATE, 1);
	}
	private _triggerEventNodes(object: Object3D, actorType: ActorType, outputIndex = 0) {
		const nodeIds = this.objectActorNodeIds(object);
		if (!nodeIds) {
			return;
		}
		for (let nodeId of nodeIds) {
			const node = this.scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
			if (node) {
				const onEventNodes = node.nodesByType(actorType);
				for (let onEventNode of onEventNodes) {
					onEventNode.runTrigger({Object3D: object}, outputIndex);
				}
			}
		}
	}

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
				CoreObject.makeAttribReactive<AttribValue>(object, attributeName, (newVal, oldVal) => {
					const context = {Object3D: object};
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
				});
			});
		});
	}

	objectActorNodeIds(object: Object3D) {
		return object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
	}

	parentActorBuilderNode(node: BaseActorNodeType) {
		return node.parentController.findParent((parent) => parent.childrenControllerContext() == NodeContext.ACTOR);
	}
}
