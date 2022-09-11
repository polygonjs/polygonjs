import type {World, RigidBody} from '@dimforge/rapier3d';
import {Object3D} from 'three';
import {CorePhysicsLoaded} from './CorePhysics';
export enum PhysicsUserData {
	WORLD = 'physicsWorld',
	RBD_BODY = 'physicsRBDBody',
}

export class CorePhysicsUserData {
	static setWorld(object: Object3D, world: World) {
		object.userData[PhysicsUserData.WORLD] = world;
	}
	static world(object: Object3D) {
		const world = object.userData[PhysicsUserData.WORLD];
		if (world) {
			const World = CorePhysicsLoaded()?.World;
			if (World && world instanceof World) {
				return world;
			}
		}
	}
	static setRigidBody(object: Object3D, rigidBody: RigidBody) {
		object.userData[PhysicsUserData.RBD_BODY] = rigidBody;
	}
	static rigidBody(object: Object3D) {
		const rigidBody = object.userData[PhysicsUserData.RBD_BODY];
		if (rigidBody) {
			const RigidBody = CorePhysicsLoaded()?.RigidBody;
			if (RigidBody && rigidBody instanceof RigidBody) {
				return rigidBody;
			}
		}
	}
}
