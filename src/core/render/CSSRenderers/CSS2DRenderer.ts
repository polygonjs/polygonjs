/*

The main modification of this compared to three's CSS2DRenderer
is the addition of removeElementsDeletedFromSceneGraph,
which allows the removal of CSS objects that are not in the scene graph anymore,
without relying on CSS2DObject `this.addEventListener( 'removed'...`,
which isn't dispatched for children of the removed object

*/

import {Matrix4, Object3D, Vector3, Scene, Camera} from 'three';
import {CSS2DObject} from './CSS2DObject';

type ObjectData = {
	distanceToCameraSquared: number;
};
export interface CSS2DParameters {
	element?: HTMLElement;
}

const _vector = new Vector3();
const _viewMatrix = new Matrix4();
const _viewProjectionMatrix = new Matrix4();
const _a = new Vector3();
const _b = new Vector3();

export class CSS2DRenderer {
	private _width = 0;
	private _height = 0;
	private _widthHalf = 0;
	private _heightHalf = 0;
	private dataByObject: WeakMap<Object3D, ObjectData> = new WeakMap();
	public domElement: HTMLElement;
	public appendedObjects: Set<CSS2DObject> = new Set();
	public objectsToRender: Set<CSS2DObject> = new Set();
	public objectsToRemove: Set<CSS2DObject> = new Set();
	constructor(parameters: CSS2DParameters = {}) {
		const domElement = parameters.element !== undefined ? parameters.element : document.createElement('div');

		domElement.style.overflow = 'hidden';

		this.domElement = domElement;
	}
	getSize() {
		return {
			width: this._width,
			height: this._height,
		};
	}

	render(scene: Scene, camera: Camera) {
		// if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
		// if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();

		_viewMatrix.copy(camera.matrixWorldInverse);
		_viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);

		this.removeElementsDeletedFromSceneGraph(scene);
		this.renderObject(scene, scene, camera);
		this.zOrder(scene);
	}

	private removeElementsDeletedFromSceneGraph(scene: Scene) {
		this.objectsToRender.clear();
		scene.traverse((object) => {
			if ((object as CSS2DObject).isCSS2DObject) {
				this.objectsToRender.add(object as CSS2DObject);
			}
		});
		this.objectsToRemove.clear();
		this.appendedObjects.forEach((appendedObject) => {
			if (!this.objectsToRender.has(appendedObject)) {
				this.objectsToRemove.add(appendedObject);
			}
		});
		this.objectsToRemove.forEach((object) => {
			this.domElement.removeChild(object.element);
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
	}

	renderObject(object: Object3D, scene: Scene, camera: Camera) {
		if ((object as CSS2DObject).isCSS2DObject) {
			_vector.setFromMatrixPosition(object.matrixWorld);
			_vector.applyMatrix4(_viewProjectionMatrix);

			const visible =
				object.visible === true &&
				_vector.z >= -1 &&
				_vector.z <= 1 &&
				object.layers.test(camera.layers) === true;
			(object as CSS2DObject).element.style.display = visible === true ? '' : 'none';

			if (visible === true) {
				(object as any).onBeforeRender(this as any, scene, camera);

				const element = (object as CSS2DObject).element;

				element.style.transform =
					'translate(-50%,-50%) translate(' +
					(_vector.x * this._widthHalf + this._widthHalf) +
					'px,' +
					(-_vector.y * this._heightHalf + this._heightHalf) +
					'px)';

				if (element.parentNode !== this.domElement) {
					this.domElement.appendChild(element);
					this.appendedObjects.add(object as CSS2DObject);
				}

				(object as any).onAfterRender(this, scene, camera);
			}

			const objectData = {
				distanceToCameraSquared: this.getDistanceToSquared(camera, object),
			};

			this.dataByObject.set(object, objectData);
		}

		for (let i = 0, l = object.children.length; i < l; i++) {
			this.renderObject(object.children[i], scene, camera);
		}
	}

	getDistanceToSquared(object1: Object3D, object2: Object3D) {
		_a.setFromMatrixPosition(object1.matrixWorld);
		_b.setFromMatrixPosition(object2.matrixWorld);

		return _a.distanceToSquared(_b);
	}

	filterAndFlatten(scene: Scene) {
		const result: CSS2DObject[] = [];

		scene.traverse(function (object) {
			if ((object as CSS2DObject).isCSS2DObject) result.push(object as CSS2DObject);
		});

		return result;
	}

	zOrder(scene: Scene) {
		const sorted = this.filterAndFlatten(scene).sort((a, b) => {
			if (a.renderOrder !== b.renderOrder) {
				return b.renderOrder - a.renderOrder;
			}

			const distanceA = this.dataByObject.get(a)?.distanceToCameraSquared || 0;
			const distanceB = this.dataByObject.get(b)?.distanceToCameraSquared || 0;

			return distanceA - distanceB;
		});

		const zMax = sorted.length;

		for (let i = 0, l = sorted.length; i < l; i++) {
			sorted[i].element.style.zIndex = `${zMax - i}`;
		}
	}
}
