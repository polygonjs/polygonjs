import type {World, ColliderDesc, RigidBodyDesc, JointData} from '@dimforge/rapier3d';

export interface PhysicsLib {
	World: typeof World;
	ColliderDesc: typeof ColliderDesc;
	RigidBodyDesc: typeof RigidBodyDesc;
	JointData: typeof JointData;
}

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
