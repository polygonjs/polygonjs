import {Octree} from '../../../three/examples/jsm/math/Octree';
import {Capsule} from '../../../three/examples/jsm/math/Capsule';
import {Vector3} from 'three/src/math/Vector3';
import {Object3D} from 'three/src/core/Object3D';

interface CapsuleCollisionResult {
	normal: Vector3;
	point: Vector3;
	depth: number;
}

export class PlayerCollisionController {
	private _octree = new Octree();
	private _capsuleHeight = new Vector3(0, 1, 0);
	private _capsule = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.6);
	constructor(private _object: Object3D) {
		this._octree.fromGraphNode(this._object);
	}

	setCapsule(capsule: Capsule) {
		this._capsule.copy(capsule);
		this._capsuleHeight.copy(capsule.end).sub(capsule.start);
	}

	testPosition(position: Vector3): CapsuleCollisionResult | false {
		this._capsule.end.copy(position);
		this._capsule.start.copy(position).sub(this._capsuleHeight);

		return this._octree.capsuleIntersect(this._capsule);
	}
}
