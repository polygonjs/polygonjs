import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Vector3} from 'three/src/math/Vector3';
import {Raycaster, Intersection} from 'three/src/core/Raycaster';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Material} from 'three/src/materials/Material';
import {Side} from 'three/src/constants';

import {DoubleSide} from 'three/src/constants';
import {CoreType} from '../../../core/Type';

interface RaySopParams extends DefaultOperationParams {
	useNormals: boolean;
	direction: Vector3;
	transferFaceNormals: boolean;
}

export class RaySopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: RaySopParams = {
		useNormals: true,
		direction: new Vector3(0, -1, 0),
		transferFaceNormals: true,
	};
	static readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.ALWAYS];
	static type(): Readonly<'ray'> {
		return 'ray';
	}

	private _bound_setMat = this._setObjectMaterialDoubleSided.bind(this);
	private _bound_restoreMat = this._restoreObjectMaterialSide.bind(this);
	private _sidePropertyByMaterial: WeakMap<Material, Side> = new WeakMap();
	private _raycaster = new Raycaster();

	cook(input_contents: CoreGroup[], params: RaySopParams) {
		const coreGroupToRay = input_contents[0];
		const coreGroupToRayOnto = input_contents[1];

		const coreGroup = this._ray(coreGroupToRay, coreGroupToRayOnto, params);
		return coreGroup;
	}

	private _pointPos = new Vector3();
	private _pointNormal = new Vector3();
	private _ray(core_group: CoreGroup, core_group_collision: CoreGroup, params: RaySopParams) {
		this._setCoreGroupMaterialDoubleSided(core_group_collision);

		let direction: Vector3, first_intersect: Intersection;
		const points = core_group.points();
		for (let point of points) {
			point.getPosition(this._pointPos);
			direction = params.direction;
			if (isBooleanTrue(params.useNormals)) {
				point.getNormal(this._pointNormal);
				direction = this._pointNormal;
			}
			this._raycaster.set(this._pointPos, direction);
			first_intersect = this._raycaster.intersectObjects(core_group_collision.objects(), true)[0];
			if (first_intersect) {
				point.setPosition(first_intersect.point);
				if (isBooleanTrue(params.transferFaceNormals) && first_intersect.face) {
					point.setNormal(first_intersect.face.normal);
				}
			}
		}
		this._restoreMaterialSideProperty(core_group_collision);
		return core_group;
	}

	private _setCoreGroupMaterialDoubleSided(core_group: CoreGroup) {
		const objects = core_group.objects();
		for (let object of objects) {
			object.traverse(this._bound_setMat);
		}
	}
	private _restoreMaterialSideProperty(core_group: CoreGroup) {
		const objects = core_group.objects();
		for (let object of objects) {
			object.traverse(this._bound_restoreMat);
		}
	}
	private _setObjectMaterialDoubleSided(object: Object3D) {
		const mat = (object as Mesh).material;
		if (mat) {
			if (CoreType.isArray(mat)) {
				for (let mati of mat) {
					this._setMaterialDoubleSided(mati);
				}
			} else {
				this._setMaterialDoubleSided(mat);
			}
		}
	}
	private _restoreObjectMaterialSide(object: Object3D) {
		const mat = (object as Mesh).material;
		if (mat) {
			if (CoreType.isArray(mat)) {
				for (let mati of mat) {
					this._restoreMaterialDoubleSided(mati);
				}
			} else {
				this._restoreMaterialDoubleSided(mat);
			}
		}
	}
	private _setMaterialDoubleSided(mat: Material) {
		this._sidePropertyByMaterial.set(mat, mat.side);
		mat.side = DoubleSide;
	}
	private _restoreMaterialDoubleSided(mat: Material) {
		mat.side = this._sidePropertyByMaterial.get(mat) || DoubleSide;
	}
}
