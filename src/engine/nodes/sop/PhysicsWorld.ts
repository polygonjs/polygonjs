/**
 * Create a physics world
 *
 *
 */
import {Group, Object3D} from 'three';
import {
	initCorePhysicsWorld,
	physicsWorldNodeIdFromObject,
	PHYSICS_GRAVITY_DEFAULT,
} from './../../../core/physics/PhysicsWorld';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {ActorNodeChildrenMap} from '../../poly/registers/nodes/Actor';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseActorNodeType} from '../actor/_Base';
import {createOrFindPhysicsWorld} from '../../../core/physics/PhysicsWorld';
import {physicsCreateDebugObject, updatePhysicsDebugObject} from '../../../core/physics/PhysicsDebug';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PolyScene} from '../../scene/PolyScene';
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Poly} from '../../Poly';
import {CoreObject} from '../../../core/geometry/Object';
import {PhysicsIdAttribute} from '../../../core/physics/PhysicsAttribute';
import {CorePhysics} from '../../../core/physics/CorePhysics';
import {setJointDataListForWorldObject} from '../../../core/physics/PhysicsJoint';
class PhysicsWorldSopParamsConfig extends NodeParamsConfig {
	/** @param gravity */
	gravity = ParamConfig.VECTOR3(PHYSICS_GRAVITY_DEFAULT);
	/** @param display debug information */
	debug = ParamConfig.BOOLEAN(0);
	/** @param actor node */
	// node = ParamConfig.NODE_PATH('', {
	// 	visibleIf: {useThisNode: 0},
	// 	// nodeSelection: {
	// 	// 	// context: NodeContext.ACTOR,
	// 	// },
	// 	dependentOnFoundNode: false,
	// });
}
const ParamsConfig = new PhysicsWorldSopParamsConfig();

export class PhysicsWorldSopNode extends TypedSopNode<PhysicsWorldSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.PHYSICS_WORLD {
		return SopType.PHYSICS_WORLD;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		// set to always clone, so that we reset the world
		// by simply setting this node to dirty
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}

	// private _PhysicsLib: PhysicsLib | undefined;
	override async cook(inputCoreGroups: CoreGroup[]) {
		await CorePhysics();
		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));
		const coreGroup = inputCoreGroups[0];

		const worldObject = new Group();
		worldObject.name = this.name();
		worldObject.matrixAutoUpdate = false;
		CoreObject.addAttribute(worldObject, PhysicsIdAttribute.WORLD, this.graphNodeId());

		const inputObjects = coreGroup.threejsObjects();
		for (let inputObject of inputObjects) {
			worldObject.add(inputObject);
		}
		setJointDataListForWorldObject(worldObject);

		// const {world, PhysicsLib} = await createOrFindPhysicsWorld(this, worldObject, this.pv.gravity);
		// this._PhysicsLib = PhysicsLib;
		// initCorePhysicsWorld(this._PhysicsLib, worldObject, this.scene());

		// if (actorNode) {
		// }
		const objects: Object3D[] = [worldObject];
		if (isBooleanTrue(this.pv.debug)) {
			// const pair = createOrFindPhysicsDebugObject(this, world);
			// updatePhysicsDebugObject(pair);
			const debugObject = physicsCreateDebugObject();
			CoreObject.addAttribute(debugObject, PhysicsIdAttribute.DEBUG, this.graphNodeId());
			debugObject.name = `${this.name()}_Debug`;
			objects.push(debugObject);
		}
		const actorNode = this._findActorNode();
		for (let object of objects) {
			this.scene().actorsManager.assignActorBuilder(object, actorNode);
		}

		this.setObjects(objects);
	}
	traverseObjectOnSopGroupAdd(object: Object3D) {
		// if (!this._PhysicsLib) {
		// 	return;
		// }
		const worldNodeId = CoreObject.attribValue(object, PhysicsIdAttribute.WORLD);
		if (worldNodeId != null) {
			if (worldNodeId != this.graphNodeId()) {
				return;
			}
			const worldObject = object;
			createOrFindPhysicsWorld(this, worldObject, this.pv.gravity).then(({world, PhysicsLib}) => {
				initCorePhysicsWorld(PhysicsLib, worldObject, this.scene());
				// once world is create, try and find a sibbling that matches the debug object,
				// then updated it accordingly
				const sibblings = worldObject.parent?.children.filter((sibbling) => sibbling.uuid != worldObject.uuid);
				if (!sibblings) {
					return;
				}
				const debugObject = sibblings.find(
					(sibbling) => CoreObject.attribValue(sibbling, PhysicsIdAttribute.DEBUG) == this.graphNodeId()
				);
				if (debugObject) {
					updatePhysicsDebugObject(debugObject);
				}
				// if (isBooleanTrue(this.pv.debug)) {
				// 	const pair = createOrFindPhysicsDebugObject(this, world);
				// 	updatePhysicsDebugObject(pair);
				// 	objects.push(pair.object);
				// }

				// for (let object of objects) {
				// 	this.scene().actorsManager.assignActorBuilder(object, actorNode);
				// }
			});

			// initCorePhysicsWorld(this._PhysicsLib, object, this.scene());
		}
	}

	private _findActorNode() {
		// if (isBooleanTrue(this.pv.useThisNode)) {
		return this;
		// } else {
		// 	return this.pv.node.node() as ActorBuilderNode | undefined;
		// }
	}

	//
	// CHILDREN
	//
	protected override _childrenControllerContext = NodeContext.ACTOR;
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

export function getPhysicsWorldNodeFromWorldObject(
	worldObject: Object3D,
	scene: PolyScene
): PhysicsWorldSopNode | undefined {
	const nodeId = physicsWorldNodeIdFromObject(worldObject);
	if (nodeId == null) {
		return;
	}
	const graphNode = scene.graph.nodeFromId(nodeId);
	if (!graphNode) {
		return;
	}
	const node: BaseNodeType | null = CoreType.isFunction((graphNode as BaseNodeType).context)
		? (graphNode as BaseNodeType)
		: null;
	if (!node) {
		return;
	}
	if (node.context() != NodeContext.SOP) {
		return;
	}
	if (node.type() != SopType.PHYSICS_WORLD) {
		return;
	}
	return node as PhysicsWorldSopNode;
}
