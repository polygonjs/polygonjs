/**
 * Create a physics debug display
 *
 *
 */

import {TypedActorSopNode} from './_BaseActor';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {physicsCreateDebugObject} from '../../../core/physics/PhysicsDebug';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {PhysicsIdAttribute} from '../../../core/physics/PhysicsAttribute';
import {CorePhysics} from '../../../core/physics/CorePhysics';
import {coreObjectClassFactory} from '../../../core/geometry/CoreObjectFactory';
class PhysicsDebugSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PhysicsDebugSopParamsConfig();

export class PhysicsDebugSopNode extends TypedActorSopNode<PhysicsDebugSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.PHYSICS_DEBUG {
		return SopType.PHYSICS_DEBUG;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		this.compilationController.compileIfRequired();
		await CorePhysics();
		const coreGroup = inputCoreGroups[0];

		const worldObjectId = coreGroup
			.allObjects()
			.map((o) => coreObjectClassFactory(o).attribValue(o, PhysicsIdAttribute.WORLD))
			.find((id) => id != null);

		if (worldObjectId != null) {
			// initCorePhysicsDebug(this._PhysicsLib, worldObject, this.scene());
			const debugObject = physicsCreateDebugObject();
			coreObjectClassFactory(debugObject).addAttribute(
				debugObject,
				PhysicsIdAttribute.DEBUG_WORLD,
				worldObjectId
			);
			debugObject.name = `${this.name()}_Debug`;

			const actorNode = this._findActorNode();
			// // for (let object of objects) {
			// // do not assign actor node to the debug object
			this.scene().actorsManager.assignActorBuilder(debugObject, actorNode);
			// // }
			this.setObjects([debugObject]);
		} else {
			this.setObjects([]);
		}

		// const worldObject = new Group();
		// worldObject.name = this.name();
		// worldObject.matrixAutoUpdate = false;
		// Poly.onObjectsAddRemoveHooks.assignOnAddHookHandler(worldObject, this);
		// CoreObject.addAttribute(worldObject, PhysicsIdAttribute.WORLD, this.graphNodeId());

		// const inputObjects = coreGroup.threejsObjects();
		// for (let inputObject of inputObjects) {
		// 	worldObject.add(inputObject);
		// }
		// setJointDataListForWorldObject(this.scene(), worldObject);

		// // const {world, PhysicsLib} = await createOrFindPhysicsDebug(this, worldObject, this.pv.gravity);
		// // this._PhysicsLib = PhysicsLib;
		// // initCorePhysicsDebug(this._PhysicsLib, worldObject, this.scene());

		// // if (actorNode) {
		// // }
		// const objects: Object3D[] = [worldObject];
		// if (isBooleanTrue(this.pv.debug)) {
		// 	// const pair = createOrFindPhysicsDebugObject(this, world);
		// 	// updatePhysicsDebugObject(pair);
		// 	const debugObject = physicsCreateDebugObject();
		// 	CoreObject.addAttribute(debugObject, PhysicsIdAttribute.DEBUG, this.graphNodeId());
		// 	debugObject.name = `${this.name()}_Debug`;
		// 	objects.push(debugObject);
		// }
		// const actorNode = this._findActorNode();
		// // for (let object of objects) {
		// // do not assign actor node to the debug object
		// this.scene().actorsManager.assignActorBuilder(worldObject, actorNode);
		// // }

		// this.setObjects(objects);
	}
	// public override updateObjectOnAdd(object: Object3D) {
	// 	// if (!this._PhysicsLib) {
	// 	// 	return;
	// 	// }
	// 	const worldNodeId = CoreObject.attribValue(object, PhysicsIdAttribute.WORLD);
	// 	if (worldNodeId != null) {
	// 		if (worldNodeId != this.graphNodeId()) {
	// 			return;
	// 		}
	// 		const worldObject = object;
	// 		createOrFindPhysicsDebug(this, worldObject, this.pv.gravity).then(({world, PhysicsLib}) => {
	// 			initCorePhysicsDebug(PhysicsLib, worldObject, this.scene());
	// 			// once world is create, try and find a sibbling that matches the debug object,
	// 			// then updated it accordingly
	// 			const sibblings = worldObject.parent?.children.filter((sibbling) => sibbling.uuid != worldObject.uuid);
	// 			if (!sibblings) {
	// 				return;
	// 			}
	// 			const debugObject = sibblings.find(
	// 				(sibbling) => CoreObject.attribValue(sibbling, PhysicsIdAttribute.DEBUG) == this.graphNodeId()
	// 			);
	// 			if (debugObject) {
	// 				updatePhysicsDebugObject(debugObject);
	// 			}
	// 			// if (isBooleanTrue(this.pv.debug)) {
	// 			// 	const pair = createOrFindPhysicsDebugObject(this, world);
	// 			// 	updatePhysicsDebugObject(pair);
	// 			// 	objects.push(pair.object);
	// 			// }

	// 			// for (let object of objects) {
	// 			// 	this.scene().actorsManager.assignActorBuilder(object, actorNode);
	// 			// }
	// 		});

	// 		// initCorePhysicsDebug(this._PhysicsLib, object, this.scene());
	// 	}
	// }

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
	// protected override _childrenControllerContext = NodeContext.JS;
	// override createNode<S extends keyof JsNodeChildrenMap>(
	// 	node_class: S,
	// 	options?: NodeCreateOptions
	// ): JsNodeChildrenMap[S];
	// override createNode<K extends valueof<JsNodeChildrenMap>>(
	// 	node_class: Constructor<K>,
	// 	options?: NodeCreateOptions
	// ): K;
	// override createNode<K extends valueof<JsNodeChildrenMap>>(
	// 	node_class: Constructor<K>,
	// 	options?: NodeCreateOptions
	// ): K {
	// 	return super.createNode(node_class, options) as K;
	// }
	// override children() {
	// 	return super.children() as BaseJsNodeType[];
	// }
	// override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
	// 	return super.nodesByType(type) as JsNodeChildrenMap[K][];
	// }
	// override childrenAllowed() {
	// 	return true;
	// }
}

// export function getPhysicsDebugNodeFromWorldObject(
// 	worldObject: Object3D,
// 	scene: PolyScene
// ): PhysicsDebugSopNode | undefined {
// 	const nodeId = PhysicsDebugNodeIdFromObject(worldObject);
// 	if (nodeId == null) {
// 		return;
// 	}
// 	const graphNode = scene.graph.nodeFromId(nodeId);
// 	if (!graphNode) {
// 		return;
// 	}
// 	const node: BaseNodeType | null = CoreType.isFunction((graphNode as BaseNodeType).context)
// 		? (graphNode as BaseNodeType)
// 		: null;
// 	if (!node) {
// 		return;
// 	}
// 	if (node.context() != NodeContext.SOP) {
// 		return;
// 	}
// 	if (node.type() != SopType.PHYSICS_WORLD) {
// 		return;
// 	}
// 	return node as PhysicsDebugSopNode;
// }
