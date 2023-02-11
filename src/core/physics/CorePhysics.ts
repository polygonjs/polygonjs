import type {World, RigidBody, ColliderDesc, RigidBodyDesc, JointData} from '@dimforge/rapier3d';
import {Object3D} from 'three';
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
export type Object3DByRididBody = WeakMap<RigidBody, Object3D>;
export type Object3DByRididBodyByWorld = Map<World, Object3DByRididBody>;

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
		}

		_importStarted = true;
		import('@dimforge/rapier3d').then((RAPIER) => {
			physics = RAPIER;
			resolve(physics);
			if (_resolves.length > 0) {
				for (let _resolve of _resolves) {
					_resolve(physics);
				}
			}
		});
	});
}
export function CorePhysicsLoaded(): PhysicsLib | undefined {
	if (physics) {
		return physics;
	}
}
