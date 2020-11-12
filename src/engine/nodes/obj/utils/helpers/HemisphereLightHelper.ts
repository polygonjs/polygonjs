import {Color} from 'three/src/math/Color';
import {OctahedronBufferGeometry} from 'three/src/geometries/OctahedronBufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';

import {HemisphereLightObjNode} from '../../HemisphereLight';
import {Quaternion} from 'three/src/math/Quaternion';
import {Vector3} from 'three/src/math/Vector3';
import {BaseLightHelper} from './_BaseLightHelper';
import {HemisphereLight} from 'three/src/lights/HemisphereLight';

export class HemisphereLightHelper extends BaseLightHelper<HemisphereLight, HemisphereLightObjNode> {
	private _geometry = new OctahedronBufferGeometry(1);

	protected build_helper() {
		this._geometry.rotateZ(Math.PI * 0.5);

		this._material.vertexColors = true;

		const position = this._geometry.getAttribute('position');
		const colors = new Float32Array(position.count * 3);

		this._geometry.setAttribute('color', new BufferAttribute(colors, 3));
		this._object.geometry = this._geometry;
		this._object.material = this._material;
		this._object.matrixAutoUpdate = false;
	}

	// private _inverse_position = new Vector3();
	private _quat = new Quaternion();
	private _default_position = new Vector3(0, 1, 0);
	private _color1 = new Color();
	private _color2 = new Color();
	update() {
		if (!this.node.pv.position) {
			return;
		}
		// this._inverse_position.copy(this.node.pv.position).multiplyScalar(-1)
		this._object.position.copy(this.node.pv.position).multiplyScalar(-1);
		this._quat.setFromUnitVectors(this._default_position, this.node.pv.position);
		this._object.setRotationFromQuaternion(this._quat);
		this._object.scale.setScalar(this.node.pv.helper_size);
		this._object.updateMatrix()

		const colors = this._geometry.getAttribute('color') as BufferAttribute;

		this._color1.copy(this.node.light.color);
		this._color2.copy(this.node.light.groundColor);

		for (let i = 0, l = colors.count; i < l; i++) {
			const color = i < l / 2 ? this._color1 : this._color2;

			colors.setXYZ(i, color.r, color.g, color.b);
		}

		colors.needsUpdate = true;
	}
}
