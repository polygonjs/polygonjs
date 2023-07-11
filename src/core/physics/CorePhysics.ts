import type {World, RigidBody, ColliderDesc, RigidBodyDesc, JointData} from '@dimforge/rapier3d-compat';
// import {Object3D} from 'three';
interface RigidBodyType {
	Dynamic: number;
	Fixed: number;
	KinematicPositionBased: number;
	KinematicVelocityBased: number;
}
export interface PhysicsLib {
	World: typeof World;
	RigidBody: typeof RigidBody;
	ColliderDesc: typeof ColliderDesc;
	RigidBodyDesc: typeof RigidBodyDesc;
	JointData: typeof JointData;
	RigidBodyType: RigidBodyType;
	QueryFilterFlags: {
		EXCLUDE_KINEMATIC: number;
	};
}
// export type Object3DByRigidBody = WeakMap<RigidBody, Object3D>;
// export type Object3DByRigidBodyByWorld = Map<World, Object3DByRigidBody>;

let physics: PhysicsLib | undefined;

let _importStarted = false;
type Resolve = (value: PhysicsLib | PromiseLike<PhysicsLib>) => void;
let _resolves: Resolve[] = [];

export async function CorePhysics(): Promise<PhysicsLib> {
	if (physics) {
		return physics;
	}
	return new Promise((resolve) => {
		if (_importStarted) {
			_resolves.push(resolve);
			return;
		}

		_importStarted = true;
		import('@dimforge/rapier3d-compat').then((RAPIER) => {
			RAPIER.init().then(() => {
				physics = RAPIER;
				resolve(physics);
				if (_resolves.length > 0) {
					for (let _resolve of _resolves) {
						_resolve(physics);
					}
				}
			});
		});
	});
}
export function CorePhysicsLoaded(): PhysicsLib | undefined {
	if (physics) {
		return physics;
	}
}
