/*

The main modification of this compared to three's CSS2DRenderer
is the addition of removeElementsDeletedFromSceneGraph,
which allows the removal of CSS objects that are not in the scene graph anymore,
without relying on CSS2DObject `this.addEventListener( 'removed'...`,
which isn't dispatched for children of the removed object

*/

import {Matrix4, Quaternion, Vector3, Scene, Camera, OrthographicCamera, PerspectiveCamera, Object3D} from 'three';
import {CSS3DObject, CSS3DSprite} from './CSS3DObject';

export interface CSS3DParameters {
	element?: HTMLElement;
}
type ObjectData = {
	style: string;
};
interface Cache {
	camera: {
		style: string;
	};
	objects: WeakMap<CSS3DObject, ObjectData>;
}

const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();
const _matrix2 = new Matrix4();

function epsilon(value: number) {
	return Math.abs(value) < 1e-10 ? 0 : value;
}
function getObjectCSSMatrix(matrix: Matrix4) {
	const elements = matrix.elements;
	const matrix3d =
		'matrix3d(' +
		epsilon(elements[0]) +
		',' +
		epsilon(elements[1]) +
		',' +
		epsilon(elements[2]) +
		',' +
		epsilon(elements[3]) +
		',' +
		epsilon(-elements[4]) +
		',' +
		epsilon(-elements[5]) +
		',' +
		epsilon(-elements[6]) +
		',' +
		epsilon(-elements[7]) +
		',' +
		epsilon(elements[8]) +
		',' +
		epsilon(elements[9]) +
		',' +
		epsilon(elements[10]) +
		',' +
		epsilon(elements[11]) +
		',' +
		epsilon(elements[12]) +
		',' +
		epsilon(elements[13]) +
		',' +
		epsilon(elements[14]) +
		',' +
		epsilon(elements[15]) +
		')';

	return 'translate(-50%,-50%)' + matrix3d;
}
function getCameraCSSMatrix(matrix: Matrix4) {
	const elements = matrix.elements;

	return (
		'matrix3d(' +
		epsilon(elements[0]) +
		',' +
		epsilon(-elements[1]) +
		',' +
		epsilon(elements[2]) +
		',' +
		epsilon(elements[3]) +
		',' +
		epsilon(elements[4]) +
		',' +
		epsilon(-elements[5]) +
		',' +
		epsilon(elements[6]) +
		',' +
		epsilon(elements[7]) +
		',' +
		epsilon(elements[8]) +
		',' +
		epsilon(-elements[9]) +
		',' +
		epsilon(elements[10]) +
		',' +
		epsilon(elements[11]) +
		',' +
		epsilon(elements[12]) +
		',' +
		epsilon(-elements[13]) +
		',' +
		epsilon(elements[14]) +
		',' +
		epsilon(elements[15]) +
		')'
	);
}

export class CSS3DRenderer {
	private _width = 0;
	private _height = 0;
	private _widthHalf = 0;
	private _heightHalf = 0;
	public domElement: HTMLElement;
	public cameraElement: HTMLElement;
	private cache: Cache = {
		camera: {style: ''},
		objects: new WeakMap(),
	};
	public appendedObjects: Set<CSS3DObject> = new Set();
	public objectsToRender: Set<CSS3DObject> = new Set();
	public objectsToRemove: Set<CSS3DObject> = new Set();
	constructor(parameters: CSS3DParameters = {}) {
		const domElement = parameters.element !== undefined ? parameters.element : document.createElement('div');

		domElement.style.overflow = 'hidden';

		this.domElement = domElement;

		this.cameraElement = document.createElement('div');

		this.cameraElement.style.transformStyle = 'preserve-3d';
		this.cameraElement.style.pointerEvents = 'none';

		domElement.appendChild(this.cameraElement);
	}
	getSize() {
		return {
			width: this._width,
			height: this._height,
		};
	}

	render(scene: Scene, camera: Camera) {
		const fov = camera.projectionMatrix.elements[5] * this._heightHalf;

		// if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
		// if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();

		let tx = 0;
		let ty = 0;

		if ((camera as OrthographicCamera).isOrthographicCamera) {
			tx = -((camera as OrthographicCamera).right + (camera as OrthographicCamera).left) / 2;
			ty = ((camera as OrthographicCamera).top + (camera as OrthographicCamera).bottom) / 2;
		}

		const cameraCSSMatrix = (camera as OrthographicCamera).isOrthographicCamera
			? 'scale(' +
			  fov +
			  ')' +
			  'translate(' +
			  epsilon(tx) +
			  'px,' +
			  epsilon(ty) +
			  'px)' +
			  getCameraCSSMatrix(camera.matrixWorldInverse)
			: 'translateZ(' + fov + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse);

		const perspective = (camera as PerspectiveCamera).isPerspectiveCamera ? 'perspective(' + fov + 'px) ' : '';

		const style = perspective + cameraCSSMatrix + 'translate(' + this._widthHalf + 'px,' + this._heightHalf + 'px)';

		if (this.cache.camera.style !== style) {
			this.cameraElement.style.transform = style;

			this.cache.camera.style = style;
		}

		this.removeElementsDeletedFromSceneGraph(scene);
		this.renderObject(scene, scene, camera, cameraCSSMatrix);
	}
	private removeElementsDeletedFromSceneGraph(scene: Scene) {
		this.objectsToRender.clear();
		scene.traverse((object) => {
			if ((object as CSS3DObject).isCSS3DObject) {
				this.objectsToRender.add(object as CSS3DObject);
			}
		});
		this.objectsToRemove.clear();
		this.appendedObjects.forEach((appendedObject) => {
			if (!this.objectsToRender.has(appendedObject)) {
				this.objectsToRemove.add(appendedObject);
			}
		});
		this.objectsToRemove.forEach((object) => {
			this.cameraElement.removeChild(object.element);
			this.appendedObjects.delete(object);
		});
	}

	setSize(width: number, height: number) {
		this._width = width;
		this._height = height;
		this._widthHalf = this._width / 2;
		this._heightHalf = this._height / 2;

		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';

		this.cameraElement.style.width = width + 'px';
		this.cameraElement.style.height = height + 'px';
	}

	renderObject(object: Object3D, scene: Scene, camera: Camera, cameraCSSMatrix: string) {
		if ((object as CSS3DObject).isCSS3DObject) {
			const visible = object.visible === true && object.layers.test(camera.layers) === true;
			(object as CSS3DObject).element.style.display = visible === true ? '' : 'none';

			if (visible === true) {
				(object as any).onBeforeRender(this, scene, camera);

				let style;

				if ((object as CSS3DSprite).isCSS3DSprite) {
					// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

					_matrix.copy(camera.matrixWorldInverse);
					_matrix.transpose();

					if ((object as CSS3DSprite).rotation2D !== 0)
						_matrix.multiply(_matrix2.makeRotationZ((object as CSS3DSprite).rotation2D));

					object.matrixWorld.decompose(_position, _quaternion, _scale);
					_matrix.setPosition(_position);
					_matrix.scale(_scale);

					_matrix.elements[3] = 0;
					_matrix.elements[7] = 0;
					_matrix.elements[11] = 0;
					_matrix.elements[15] = 1;

					style = getObjectCSSMatrix(_matrix);
				} else {
					style = getObjectCSSMatrix(object.matrixWorld);
				}

				const element = (object as CSS3DObject).element;
				const cachedObject = this.cache.objects.get(object as CSS3DObject);

				if (cachedObject === undefined || cachedObject.style !== style) {
					element.style.transform = style;

					const objectData: ObjectData = {style: style};
					this.cache.objects.set(object as CSS3DObject, objectData);
				}

				if (element.parentNode !== this.cameraElement) {
					this.cameraElement.appendChild(element);
					this.appendedObjects.add(object as CSS3DObject);
				}

				(object as any).onAfterRender(this, scene, camera);
			}
		}

		for (let i = 0, l = object.children.length; i < l; i++) {
			this.renderObject(object.children[i], scene, camera, cameraCSSMatrix);
		}
	}
}
