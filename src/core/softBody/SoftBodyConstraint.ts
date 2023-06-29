import {Vector3} from 'three';
import {Number3} from '../../types/GlobalTypes';
import {SoftBody} from './SoftBody';
import {vecCopy} from './SoftBodyMath';

let nextId = 0;
const _p: Number3 = [0, 0, 0];

export class SoftBodyConstraint {
	public readonly id = nextId++;
	public invMass = 0;
	private _previousPosition = new Vector3();
	private _position = new Vector3();
	private _velocity = new Vector3();
	constructor(private _softBody: SoftBody | null, public readonly pointIndex: number) {
		// init position
		if (!this._softBody) {
			return;
		}
		vecCopy(_p, 0, this._softBody.pos, this.pointIndex);
		this._position.fromArray(_p);
		this._previousPosition.copy(this._position);
	}

	dispose() {
		this._softBody = null;
	}

	setPosition(position: Vector3, lerp: number, dt: number) {
		if (!this._softBody) {
			return;
		}
		this._position.lerp(position, lerp);

		this._position.toArray(_p);
		vecCopy(this._softBody.pos, this.pointIndex, _p, 0);

		this._velocity.copy(position).sub(this._previousPosition).divideScalar(dt);
		this._previousPosition.copy(this._position);
	}
	velocity(target: Number3) {
		this._velocity.toArray(target);
	}
}
