import {Object3D} from 'three';
import {Mesh} from 'three';
import {Material} from 'three';
import {Side} from 'three';
import {DoubleSide} from 'three';
import {isArray} from '../Type';
import {CoreGroup} from '../geometry/Group';

export class MatDoubleSideTmpSetter {
	private _sidePropertyByMaterial: WeakMap<Material, Side> = new WeakMap();
	private _bound_setMat = this._setObjectMaterialDoubleSided.bind(this);
	private _bound_restoreMat = this._restoreObjectMaterialSide.bind(this);

	setCoreGroupMaterialDoubleSided(core_group: CoreGroup) {
		const objects = core_group.threejsObjects();
		for (const object of objects) {
			object.traverse(this._bound_setMat);
		}
	}
	restoreMaterialSideProperty(core_group: CoreGroup) {
		const objects = core_group.threejsObjects();
		for (const object of objects) {
			object.traverse(this._bound_restoreMat);
		}
	}
	private _setObjectMaterialDoubleSided(object: Object3D) {
		const mat = (object as Mesh).material;
		if (mat) {
			if (isArray(mat)) {
				for (const mati of mat) {
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
			if (isArray(mat)) {
				for (const mati of mat) {
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
