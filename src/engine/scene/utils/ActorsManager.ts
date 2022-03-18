import {Object3D} from 'three/src/core/Object3D';
import {TypedNode} from '../../nodes/_Base';
import {BaseActorNodeType} from '../../nodes/actor/_Base';
import {ActorNodeChildrenMap} from '../../poly/registers/nodes/Actor';
import {NodeCreateOptions} from '../../nodes/utils/hierarchy/ChildrenController';
import {AttribValue, Constructor, valueof} from '../../../types/GlobalTypes';
import {ActorType} from '../../poly/registers/nodes/types/Actor';
import {PolyScene} from '../PolyScene';
import {CoreObject} from '../../../core/geometry/Object';
import {MapUtils} from '../../../core/MapUtils';
import {SceneManualActorTriggersController} from './actors/ManualActorTriggersController';
import {NodeContext} from '../../poly/NodeContext';

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
	constructor(private _scene: PolyScene) {}

	private _actorNodes: Set<ActorBuilderNode> = new Set();
	private _manualActorTriggers: SceneManualActorTriggersController | undefined;

	assignActorBuilder(object: Object3D, node: ActorBuilderNode) {
		object.userData[ACTOR_BUILDER_NODE_IDS_KEY] = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] || [];
		object.userData[ACTOR_BUILDER_NODE_IDS_KEY].push(node.graphNodeId());

		this._actorNodes.add(node);
		// this._findSceneEvents(node);
	}

	get manualActorTriggers() {
		return (this._manualActorTriggers = this._manualActorTriggers || new SceneManualActorTriggersController(this));
	}

	runManualTrigger() {
		if (!this._manualActorTriggers) {
			return;
		}
		if (!this._manualActorTriggers.triggered()) {
			return;
		}
		const triggeredNodeParent = this._manualActorTriggers.triggeredNodeParent();
		if (!triggeredNodeParent) {
			return;
		}
		const nodeToRunTriggerFrom = this._manualActorTriggers.nodeToRunTriggerFrom();
		const nodeToReceiveTrigger = this._manualActorTriggers.nodeToReceiveTrigger();

		this._manualActorTriggers.reset();

		const nodeParentId = triggeredNodeParent.graphNodeId();
		this._scene.threejsScene().traverse((object) => {
			const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
			if (!nodeIds) {
				return;
			}
			if (!nodeIds.includes(nodeParentId)) {
				return;
			}
			if (nodeToRunTriggerFrom) {
				nodeToRunTriggerFrom.runTrigger({Object3D: object});
			}
			if (nodeToReceiveTrigger) {
				nodeToReceiveTrigger.receiveTrigger({Object3D: object});
			}
		});
	}
	outputValueForFirstObject(node: BaseActorNodeType, outputName: string = '') {
		let matchedObject: Object3D | undefined;
		const parentNode = this.parentActorBuilderNode(node);
		this._scene.threejsScene().traverse((object) => {
			const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
			if (!parentNode) {
				return;
			}
			if (!nodeIds) {
				return;
			}
			if (!nodeIds.includes(parentNode.graphNodeId())) {
				return;
			}
			matchedObject = object;
		});
		if (!matchedObject) {
			return;
		}
		return node.outputValue({Object3D: matchedObject}, outputName);
	}

	onEventTick() {
		this._scene.threejsScene().traverse(this._onEventTickBound);
	}
	onEventSceneReset() {
		this._scene.threejsScene().traverse(this._onEventSceneResetBound);
	}

	private _onEventTickBound = this._onEventTick.bind(this);
	private _onEventTick(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_EVENT_TICK);
	}

	private _onEventSceneResetBound = this._onEventSceneReset.bind(this);
	private _onEventSceneReset(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_EVENT_SCENE_RESET);
	}
	private _onEventScenePlayBound = this._onEventScenePlay.bind(this);
	private _onEventScenePlay(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_EVENT_SCENE_PLAY_STATE, 0);
	}
	private _onEventScenePauseBound = this._onEventScenePause.bind(this);
	private _onEventScenePause(object: Object3D) {
		this._triggerEventNodes(object, ActorType.ON_EVENT_SCENE_PLAY_STATE, 1);
	}

	onEventScenePlay() {
		this._scene.threejsScene().traverse(this._onEventScenePlayBound);

		// any caching goes here
		this._makeRequiredObjectAttributesReactive();
	}
	onEventScenePause() {
		this._scene.threejsScene().traverse(this._onEventScenePauseBound);
	}

	private _makeRequiredObjectAttributesReactive() {
		this._scene.threejsScene().traverse((object) => {
			const getNodesByAttribName = () => {
				const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
				if (!nodeIds) {
					return;
				}

				// check nodes listening to this object
				const actorBuilderNodes = nodeIds
					.map((nodeId) => this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
					.filter((node) => node);
				const onEventObjectAttributeUpdatedNodes = actorBuilderNodes
					.map((node) => node.nodesByType(ActorType.ON_EVENT_OBJECT_ATTRIBUTE_UPDATED))
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
					.map((nodeId) => this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
					.filter((node) => node);
				const onEventChildAttributeUpdatedNodes = actorBuilderNodes
					.map((node) => node.nodesByType(ActorType.ON_EVENT_CHILD_ATTRIBUTE_UPDATED))
					.flat();
				const nodesByAttribName = MapUtils.groupBy(onEventChildAttributeUpdatedNodes, (node) =>
					node.attributeName()
				);
				return nodesByAttribName;
			};

			const nodesByAttribName = getNodesByAttribName();
			const parentNodesByAttribName = getParentNodesByAttribName();
			if (!nodesByAttribName) {
				return;
			}
			nodesByAttribName.forEach((nodes, attributeName) => {
				const parentNodes = parentNodesByAttribName?.get(attributeName);

				// apply callback
				CoreObject.makeAttribReactive<AttribValue>(object, attributeName, (newVal, oldVal) => {
					const context = {Object3D: object};
					for (let node of nodes) {
						node.runTrigger(context);
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
	actorNodesForObject(object: Object3D) {
		const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
		if (!nodeIds) {
			return;
		}

		const actorBuilderNodes = nodeIds
			.map((nodeId) => this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
			.filter((node) => node);
		return actorBuilderNodes;
	}

	private _triggerEventNodes(object: Object3D, actorType: ActorType, outputIndex = 0) {
		const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
		if (!nodeIds) {
			return;
		}
		for (let nodeId of nodeIds) {
			const node = this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
			if (node) {
				const onEventNodes = node.nodesByType(actorType);
				for (let onEventNode of onEventNodes) {
					onEventNode.runTrigger({Object3D: object}, outputIndex);
				}
			}
		}
	}

	public parentActorBuilderNode(node: BaseActorNodeType) {
		return node.parentController.findParent((parent) => parent.childrenControllerContext() == NodeContext.ACTOR);
	}
}
