import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {PlayerCollisionController} from './collisions/PlayerCollisionsController';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Capsule} from 'three/examples/jsm/math/Capsule';
import {EventDispatcher} from 'three/src/core/EventDispatcher';
import {Vector3} from 'three/src/math/Vector3';

export interface JumpParams {
	duration: number;
	force: number;
}

export class BaseCollisionHandler extends EventDispatcher {
	protected _playerCollisionController: PlayerCollisionController | undefined;

	setCheckCollisions(collisionObject?: Object3D) {
		if (collisionObject) {
			let objectWithGeo: Object3DWithGeometry | undefined;
			collisionObject.traverse((child) => {
				if (!objectWithGeo) {
					const mesh = child as Mesh;
					if (mesh.geometry) {
						objectWithGeo = mesh;
					}
				}
			});
			if (objectWithGeo) {
				this._playerCollisionController = new PlayerCollisionController(objectWithGeo);
			} else {
				console.error('no geo found in', collisionObject);
			}
		} else {
			this._playerCollisionController = undefined;
		}
	}
	setCollisionCapsule(capsule: Capsule) {
		this._playerCollisionController?.setCapsule(capsule);
	}
	setJumpParams(params: JumpParams) {}
	setGravity(gravity: Vector3) {}
	setPlayerMass(mass: number) {}
}
