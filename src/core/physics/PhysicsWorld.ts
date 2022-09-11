import {CorePhysics} from './CorePhysics';
import {World, RigidBody, Collider} from '@dimforge/rapier3d';
import {CorePhysicsUserData} from './PhysicsUserData';
import {Object3D, Vector3} from 'three';
import {physicsCreateRBD, physicsUpdateRBD} from './PhysicsRBD';
import {physicsCreateJoint} from './PhysicsJoint';

export const PHYSICS_GRAVITY_DEFAULT = new Vector3(0, -9.81, 0);

export async function createWorld(worldObject: Object3D, gravity: Vector3) {
	const PhysicsLib = await CorePhysics();
	// const gravity = {x: 0.0, y: -9.81, z: 0.0};
	const world = new PhysicsLib.World(gravity);
	CorePhysicsUserData.setWorld(worldObject, world);
}

export async function initCorePhysicsWorld(worldObject: Object3D) {
	const world = CorePhysicsUserData.world(worldObject);
	if (!world) {
		console.warn('no physicsWorld found with this object', worldObject);
		return;
	}
	_clearWorld(world);

	// create RBDs
	const rigidBodyById: Map<string, RigidBody> = new Map();
	const PhysicsLib = await CorePhysics();
	for (let child of worldObject.children) {
		const result = physicsCreateRBD(PhysicsLib, world, child);
		if (result) {
			const {rigidBody, id} = result;
			rigidBodyById.set(id, rigidBody);
		}
	}

	// create joints
	for (let child of worldObject.children) {
		physicsCreateJoint(PhysicsLib, world, worldObject, child, rigidBodyById);
	}
}

function _clearWorld(world: World) {
	const bodies: RigidBody[] = [];
	const colliders: Collider[] = [];
	world.bodies.forEach((body) => {
		bodies.push(body);
	});
	world.colliders.forEach((collider) => {
		colliders.push(collider);
	});
	for (let body of bodies) {
		world.removeRigidBody(body);
	}
	for (let collider of colliders) {
		world.removeCollider(collider, false);
	}
}

export function stepWorld(worldObject: Object3D) {
	const world = CorePhysicsUserData.world(worldObject);
	if (!world) {
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
	const world = CorePhysicsUserData.world(worldObject);
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
