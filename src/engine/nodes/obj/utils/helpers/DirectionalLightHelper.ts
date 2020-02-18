// import {Object3D} from 'three/src/core/Object3D';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {DirectionalLightObjNode} from '../../DirectionalLight';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {BaseLightHelper} from './_BaseLightHelper';
import {Line} from 'three/src/objects/Line';

export class DirectionalLightHelper extends BaseLightHelper<DirectionalLight, DirectionalLightObjNode> {
	private _square = new Line();
	private _line_material = new LineBasicMaterial({fog: false});
	protected build_helper() {
		const geometry = new BufferGeometry();
		const size = 1;
		geometry.setAttribute(
			'position',
			new Float32BufferAttribute(
				[-size, size, 0, size, size, 0, size, -size, 0, -size, -size, 0, -size, size, 0],
				3
			)
		);

		this._square.geometry = geometry;
		this._square.material = this._line_material;
		this._square.rotateX(Math.PI * 0.5);

		this.object.add(this._square);
	}

	// private _v1 = new Vector3();
	// private _v2 = new Vector3();
	// private _v3 = new Vector3();
	update() {
		// this._v1.copy(this.node.light.position);
		// this._v2.copy(this.node.light.target.position);
		// this._v3.subVectors(this._v2, this._v1);

		// this._object.position.copy(this.node.pv.position).multiplyScalar(-1);
		// this._quat.setFromUnitVectors(this._default_position, this.node.pv.position);
		// this._object.setRotationFromQuaternion(this._quat);
		this._object.scale.setScalar(this.node.pv.helper_size);

		this._line_material.color.copy(this.node.light.color);
	}
}
