import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {DirectionalLightObjNode} from '../../DirectionalLight';
import {DirectionalLight} from 'three/src/lights/DirectionalLight';
import {BaseLightHelper} from './_BaseLightHelper';
import {Line} from 'three/src/objects/Line';
import {Mesh} from 'three/src/objects/Mesh';
import {CameraHelper} from './CameraHelper';

export class DirectionalLightHelper extends BaseLightHelper<Mesh, DirectionalLight, DirectionalLightObjNode> {
	createObject() {
		return new Mesh();
	}
	private _square = new Line();
	private _line_material = new LineBasicMaterial({fog: false});
	private _cameraHelper!: CameraHelper;
	protected buildHelper() {
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
		this._square.updateMatrix();
		this._square.matrixAutoUpdate = false;

		this.object.add(this._square);

		this._cameraHelper = new CameraHelper(this.node.light.shadow.camera);
		this._cameraHelper.rotateX(-Math.PI * 0.5);
		this._cameraHelper.updateMatrix();
		this._cameraHelper.matrixAutoUpdate = false;
		this.object.add(this._cameraHelper);
	}

	update() {
		this._object.updateMatrix();
		this._cameraHelper.update();

		this._line_material.color.copy(this.node.light.color);
	}
}
