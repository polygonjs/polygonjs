import {Octree} from 'three/examples/jsm/math/Octree';
import {Capsule} from 'three/examples/jsm/math/Capsule';
import {Vector3} from 'three/src/math/Vector3';
import {Object3D} from 'three/src/core/Object3D';

export class PlayerCollisionController {
	private _octree = new Octree();
	private _capsule = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.6);
	constructor(private _object: Object3D) {
		this._octree.fromGraphNode(this._object);
	}

	setCapsule(capsule: Capsule) {
		this._capsule.copy(capsule);
	}

	testPosition(position: Vector3) {
		this._capsule.start.x = position.x;
		this._capsule.start.z = position.z;
		this._capsule.end.x = position.x;
		this._capsule.end.z = position.z;

		return this._octree.capsuleIntersect(this._capsule);
	}
}
