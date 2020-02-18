import {PointLightObjNode} from '../../PointLight';
// import {Mesh} from 'three/src/objects/Mesh';
// import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {SphereBufferGeometry} from 'three/src/geometries/SphereGeometry';
import {BaseLightHelper} from './_BaseLightHelper';
import {PointLight} from 'three/src/lights/PointLight';

export class PointLightHelper extends BaseLightHelper<PointLight, PointLightObjNode> {
	protected build_helper() {
		const size = 1;
		this._object.geometry = new SphereBufferGeometry(size, 4, 2);
		this._object.material = this._material;
	}

	update() {
		this._object.scale.setScalar(this.node.pv.helper_size);
		this._material.color.copy(this.node.light.color);
	}
}
