import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {Euler} from 'three/src/math/Euler';
import {Mesh} from 'three/src/objects/Mesh';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DecalGeometry} from '../../../modules/three/examples/jsm/geometries/DecalGeometry';
import {DEG2RAD} from 'three/src/math/MathUtils';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface DecalSopParams extends DefaultOperationParams {
	t: Vector3;
	r: Vector3;
	s: Vector3;
	scale: number;
}

export class DecalSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: DecalSopParams = {
		t: new Vector3(0, 0, 0),
		r: new Vector3(0, 0, 0),
		s: new Vector3(1, 1, 1),
		scale: 1,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'decal'> {
		return 'decal';
	}

	private _r = new Vector3();
	private _rotation = new Euler(0, 0, 0);
	private _scale = new Vector3(1, 1, 1);
	override cook(inputContents: CoreGroup[], params: DecalSopParams) {
		const inputCoreGroup = inputContents[0];

		this._r.copy(params.r).multiplyScalar(DEG2RAD);
		this._rotation.set(this._r.x, this._r.y, this._r.z);
		this._scale.copy(params.s).multiplyScalar(params.scale);

		const objects = inputCoreGroup.objectsWithGeo() as Mesh[];
		const decalObjects: Mesh[] = [];
		for (let object of objects) {
			if (object.isMesh) {
				const decal = new DecalGeometry(object, params.t, this._rotation, this._scale);
				const decalObject = new Mesh(decal, object.material);
				decalObjects.push(decalObject);
			}
		}
		return this.createCoreGroupFromObjects(decalObjects);
	}
}
