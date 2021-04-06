import {SpotLightObjNode} from '../../SpotLight';
import {BaseLightHelper} from './_BaseLightHelper';
import {SpotLight} from 'three/src/lights/SpotLight';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Vector3} from 'three/src/math/Vector3';
import {Mesh} from 'three/src/objects/Mesh';
import {Object3D} from 'three/src/core/Object3D';

interface UpdateConeObjectOptions {
	sizeMult: number;
	distance: number;
	angle: number;
}
export class SpotLightHelper extends BaseLightHelper<Mesh, SpotLight, SpotLightObjNode> {
	createObject() {
		return new Mesh();
	}
	private _cone = new LineSegments();
	private _line_material = new LineBasicMaterial({fog: false});

	static buildConeGeometry() {
		const geometry = new BufferGeometry();

		const positions = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, -1, 1];

		for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
			const p1 = (i / l) * Math.PI * 2;
			const p2 = (j / l) * Math.PI * 2;

			positions.push(Math.cos(p1), Math.sin(p1), 1, Math.cos(p2), Math.sin(p2), 1);
		}

		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		return geometry;
	}
	private static _matrix_scale = new Vector3();
	static updateConeObject(object: Object3D, options: UpdateConeObjectOptions) {
		const coneLength = (options.distance ? options.distance : 1000) * options.sizeMult;
		const coneWidth = coneLength * Math.tan(options.angle);

		this._matrix_scale.set(coneWidth, coneWidth, coneLength);
		object.matrix.identity();
		object.matrix.makeRotationX(Math.PI * 0.5);
		object.matrix.scale(this._matrix_scale);
	}

	protected buildHelper() {
		this._cone.geometry = SpotLightHelper.buildConeGeometry();
		this._cone.material = this._line_material;
		this._cone.matrixAutoUpdate = false;

		this.object.add(this._cone);
	}

	update() {
		SpotLightHelper.updateConeObject(this._cone, {
			sizeMult: this.node.pv.helperSize,
			distance: this.node.light.distance,
			angle: this.node.light.angle,
		});

		this._line_material.color.copy(this.node.light.color);
	}
}
