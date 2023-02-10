import {CorePhysics} from './CorePhysics';
import type {World, RigidBody, Collider, ImpulseJoint, MultibodyJoint} from '@dimforge/rapier3d';
// import {CorePhysicsUserData} from './PhysicsUserData';
import {Object3D, Vector3} from 'three';
import {physicsCreateRBD, physicsUpdateRBD} from './PhysicsRBD';
import {physicsCreateJoint} from './PhysicsJoint';
import {CoreGraphNodeId} from '../graph/CoreGraph';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {CoreObject} from '../geometry/Object';
import {PhysicsIdAttribute} from './PhysicsAttribute';
import {physicsDebugPairFromDebugObject, updatePhysicsDebugObject} from './PhysicsDebug';
import {clearPhysicsPlayers, createOrFindPhysicsPlayer} from './player/PhysicsPlayer';
import {PolyScene} from '../../engine/scene/PolyScene';

export const PHYSICS_GRAVITY_DEFAULT = new Vector3(0, -9.81, 0);

const physicsworldByGraphNodeId: Map<CoreGraphNodeId, World> = new Map();
export async function createOrFindPhysicsWorld(node: BaseNodeType, worldObject: Object3D, gravity: Vector3) {
	const nodeId = node.graphNodeId();
	let world = physicsworldByGraphNodeId.get(nodeId);
	if (!world) {
		const PhysicsLib = await CorePhysics();
		// const gravity = {x: 0.0, y: -9.81, z: 0.0};
		world = new PhysicsLib.World(gravity);
		physicsworldByGraphNodeId.set(nodeId, world);
	}

	CoreObject.addAttribute(worldObject, PhysicsIdAttribute.WORLD, nodeId);
	return world;
}
export function physicsWorldNodeIdFromObject(worldObject: Object3D) {
	const nodeId = CoreObject.attribValue(worldObject, PhysicsIdAttribute.WORLD) as CoreGraphNodeId | undefined;
	return nodeId;
}

export function physicsWorldFromObject(worldObject: Object3D) {
	const nodeId = CoreObject.attribValue(worldObject, PhysicsIdAttribute.WORLD) as CoreGraphNodeId | undefined;
	if (nodeId == null) {
		return;
	}
	return physicsworldByGraphNodeId.get(nodeId);
}

export async function initCorePhysicsWorld(worldObject: Object3D, scene: PolyScene) {
	const world = physicsWorldFromObject(worldObject);
	if (!world) {
		console.warn('no physicsWorld found with this object', worldObject);
		return;
	}
	_clearWorld(world);

	// create RBDs
	const rigidBodyById: Map<string, RigidBody> = new Map();
	const PhysicsLib = await CorePhysics();
	// we keep a copy of the children here,
	// as they are removed/added inside physicsCreateRBD
	// in order to compute relative transform
	// (even though there surely are ways to avoid this remove/add)
	// We also need to keep a copy as when traversing to create the joints,
	// we end up removing them from the hierarchy
	const children = [...worldObject.children];
	for (let child of children) {
		const result = physicsCreateRBD(PhysicsLib, world, child);
		if (result) {
			const {rigidBody, id} = result;
			rigidBodyById.set(id, rigidBody);
		}
	}

	// create joints
	for (let child of children) {
		physicsCreateJoint(PhysicsLib, world, worldObject, child, rigidBodyById);
	}
	// create character controller
	for (let child of children) {
		createOrFindPhysicsPlayer({scene, object: child, PhysicsLib, world, worldObject});
	}
}

function _clearWorld(world: World) {
	const bodies: RigidBody[] = [];
	const colliders: Collider[] = [];
	const joints: ImpulseJoint[] = [];
	const multiBodyJoints: MultibodyJoint[] = [];
	world.bodies.forEach((body) => {
		bodies.push(body);
	});
	world.colliders.forEach((collider) => {
		colliders.push(collider);
	});
	world.impulseJoints.forEach((joint) => {
		joints.push(joint);
	});
	world.multibodyJoints.forEach((multiBodyJoint) => {
		multiBodyJoints.push(multiBodyJoint);
	});
	for (let body of bodies) {
		world.removeRigidBody(body);
	}
	for (let collider of colliders) {
		world.removeCollider(collider, false);
	}
	for (let joint of joints) {
		world.removeImpulseJoint(joint, false);
	}
	for (let joint of multiBodyJoints) {
		world.removeMultibodyJoint(joint, false);
	}

	clearPhysicsPlayers();
}

export function stepWorld(worldObject: Object3D) {
	const world = physicsWorldFromObject(worldObject);
	if (!world) {
		// if it is not the word, maybe it is the debug object
		const pair = physicsDebugPairFromDebugObject(worldObject);
		if (!pair) {
			return;
		}
		updatePhysicsDebugObject(pair);
		return;
	}
	world.step();
	for (let child of worldObject.children) {
		physicsUpdateRBD(child);
	}
}

const currentGravity = new Vector3();
const newGravity = new Vector3();
export function setWorldGravity(worldObject: Object3D, gravity: Vector3, lerp: number) {
	const world = physicsWorldFromObject(worldObject);
	if (!world) {
		return;
	}
	if (lerp < 1) {
		currentGravity.set(world.gravity.x, world.gravity.y, world.gravity.z);
		newGravity.copy(gravity);
		currentGravity.lerp(newGravity, lerp);
	}
	world.gravity.x = gravity.x;
	world.gravity.y = gravity.y;
	world.gravity.z = gravity.z;
}
