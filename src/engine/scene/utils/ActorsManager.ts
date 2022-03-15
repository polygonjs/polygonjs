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
import {SceneConnectionTriggerDispatcher} from './actors/ConnectionTriggerDispatcher';

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
	private _connectionTriggerDispatcher: SceneConnectionTriggerDispatcher | undefined;

	assignActorBuilder(object: Object3D, node: ActorBuilderNode) {
		object.userData[ACTOR_BUILDER_NODE_IDS_KEY] = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] || [];
		object.userData[ACTOR_BUILDER_NODE_IDS_KEY].push(node.graphNodeId());

		this._actorNodes.add(node);
		// this._findSceneEvents(node);
	}

	get manualActorTriggers() {
		return (this._manualActorTriggers = this._manualActorTriggers || new SceneManualActorTriggersController(this));
	}
	get connectionTriggerDispatcher() {
		return (this._connectionTriggerDispatcher =
			this._connectionTriggerDispatcher || new SceneConnectionTriggerDispatcher(this));
	}

	runManualTrigger() {
		if (!this._manualActorTriggers) {
			return;
		}
		if (!this._manualActorTriggers.triggered()) {
			return;
		}
		const triggerNode = this._manualActorTriggers.triggeredNode();
		const triggeredNodeParent = this._manualActorTriggers.triggeredNodeParent();
		if (!(triggerNode && triggeredNodeParent)) {
			return;
		}
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
			triggerNode.runTrigger({Object3D: object});
		});
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

	private _triggerEventNodes(object: Object3D, actorType: ActorType) {
		const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
		if (!nodeIds) {
			return;
		}
		for (let nodeId of nodeIds) {
			const node = this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
			if (node) {
				const onEventNodes = node.nodesByType(actorType);
				for (let onEventNode of onEventNodes) {
					onEventNode.runTrigger({Object3D: object});
				}
			}
		}
	}

	onScenePlay() {
		// any caching goes here
		this._scene.threejsScene().traverse((object) => {
			const nodeIds = object.userData[ACTOR_BUILDER_NODE_IDS_KEY] as number[] | undefined;
			if (!nodeIds) {
				return;
			}

			const actorBuilderNodes = nodeIds
				.map((nodeId) => this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode)
				.filter((node) => node);
			const onObjectAttributeUpdatedNodes = actorBuilderNodes
				.map((node) => node.nodesByType(ActorType.ON_OBJECT_ATTRIBUTE_UPDATED))
				.flat();
			const nodesByAttribName = MapUtils.groupBy(onObjectAttributeUpdatedNodes, (node) => node.attributeName());

			nodesByAttribName.forEach((nodes, attributeName) => {
				CoreObject.makeAttribReactive<AttribValue>(object, attributeName, (newVal, oldVal) => {
					for (let node of nodes) {
						node.runTrigger({Object3D: object});
					}
				});
			});
		});
	}
}
