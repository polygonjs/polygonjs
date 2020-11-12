import {PointLightObjNode} from '../../PointLight';
import {SphereBufferGeometry} from 'three/src/geometries/SphereBufferGeometry';
import {BaseLightHelper} from './_BaseLightHelper';
import {PointLight} from 'three/src/lights/PointLight';
import {Vector3} from 'three/src/math/Vector3';

export class PointLightHelper extends BaseLightHelper<PointLight, PointLightObjNode> {
	protected build_helper() {
		const size = 1;
		this._object.geometry = new SphereBufferGeometry(size, 4, 2);
		this._object.matrixAutoUpdate = false;
		this._object.material = this._material;
	}

	private _matrix_scale = new Vector3(1, 1, 1);
	update() {
		const size = this.node.pv.helper_size;
		this._matrix_scale.set(size, size, size);
		this._object.matrix.identity();
		this._object.matrix.scale(this._matrix_scale);

		this._material.color.copy(this.node.light.color);
	}
}
