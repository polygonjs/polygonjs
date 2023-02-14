import {Matrix4} from 'three';
import {Object3D} from 'three';
import {Vector3} from 'three';

import {CSS2DObject} from '../objects/CSS2DObject';
import {Scene} from 'three';
import {Camera} from 'three';
import {CoreMath} from '../../../core/math/_Module';

// converted from threejs CSS2Drenderer https://github.com/mrdoob/three.js/blob/dev/examples/jsm/renderers/CSS2DRenderer.js
// original @author mrdoob / http://mrdoob.com/
export class CSS2DRenderer {
	private _width: number = 0;
	private _height: number = 0;
	private _widthHalf: number = 0;
	private _heightHalf: number = 0;

	private vector = new Vector3();
	private viewMatrix = new Matrix4();
	private viewProjectionMatrix = new Matrix4();
	private cache_distanceToCameraSquared: WeakMap<Object3D, number> = new WeakMap();
	public readonly domElement = document.createElement('div');
	private _sort_objects: boolean = false;

	// fog
	private _use_fog = false;
	private _fog_near = 1;
	private _fog_far = 100;

	constructor() {
		this.domElement.classList.add('polygonjs-CSS2DRenderer');
	}

	getSize() {
		return {
			width: this._width,
			height: this._height,
		};
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
		if (object instanceof CSS2DObject) {
			this.vector.setFromMatrixPosition(object.matrixWorld);
			this.vector.applyMatrix4(this.viewProjectionMatrix);
			const visible =
				object.visible === true &&
				this.vector.z >= -1 &&
				this.vector.z <= 1 &&
				object.layers.test(camera.layers) === true;
			object.element.style.display = visible === true ? '' : 'none';

			if (visible) {
				// object.onBeforeRender(this, scene, camera);

				var element = object.element;
				var style =
					'translate(-50%,-50%) translate(' +
					(this.vector.x * this._widthHalf + this._widthHalf) +
					'px,' +
					(-this.vector.y * this._heightHalf + this._heightHalf) +
					'px)';

				element.style.webkitTransform = style;
				// element.style.MozTransform = style;
				// element.style.Transform = style;
				element.style.transform = style;

				// element.style.display = object.visible && this.vector.z >= -1 && this.vector.z <= 1 ? '' : 'none';
				// opacity was previously set here in case the _use_fog was changed from true to false and opacity had to be reset. But that causes problems for cases where css is app specific and is set in integrations in an app. So for now, for opacity to be updated correctly, a page reload will be needed. (an alternative could be to have a this._use_fog_updated and have an else clause below, but that could have an unwanted performance cost)
				// element.style.opacity = `1`;

				if (this._sort_objects || this._use_fog) {
					const dist_to_squared = this.getDistanceToSquared(camera, object);
					if (this._use_fog) {
						const dist = Math.sqrt(dist_to_squared);
						const dist_remapped = CoreMath.fit(dist, this._fog_near, this._fog_far, 0, 1);
						const opacity = CoreMath.clamp(1 - dist_remapped, 0, 1);
						element.style.opacity = `${opacity}`;
						if (opacity == 0) {
							element.style.display = 'none';
						}
					}

					this.cache_distanceToCameraSquared.set(object, dist_to_squared);
				}
				if (element.parentNode !== this.domElement) {
					this.domElement.appendChild(element);
				}

				// object.onAfterRender(_this, scene, camera);
			}
		}

		for (var i = 0, l = object.children.length; i < l; i++) {
			this.renderObject(object.children[i], scene, camera);
		}
	}

	private a = new Vector3();
	private b = new Vector3();
	getDistanceToSquared(object1: Object3D, object2: Object3D) {
		this.a.setFromMatrixPosition(object1.matrixWorld);
		this.b.setFromMatrixPosition(object2.matrixWorld);

		return this.a.distanceToSquared(this.b);
	}

	filterAndFlatten(scene: Scene) {
		const result: CSS2DObject[] = [];

		scene.traverse(function (object) {
			if (object instanceof CSS2DObject) result.push(object);
		});

		return result;
	}

	render(scene: Scene, camera: Camera) {
		if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();
		if (camera.parent === null) camera.updateMatrixWorld();

		this.viewMatrix.copy(camera.matrixWorldInverse);
		this.viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, this.viewMatrix);

		this.renderObject(scene, scene, camera);
		if (this._sort_objects) {
			this.zOrder(scene);
		}
	}

	//
	//
	// SORTING
	//
	//
	set_sorting(state: boolean) {
		this._sort_objects = state;
	}
	zOrder(scene: Scene) {
		const sorted = this.filterAndFlatten(scene).sort((a, b) => {
			const distanceA = this.cache_distanceToCameraSquared.get(a);
			const distanceB = this.cache_distanceToCameraSquared.get(b);
			if (distanceA != null && distanceB != null) {
				return distanceA - distanceB;
			} else {
				return 0;
			}
		});

		const zMax = sorted.length;

		for (let i = 0, l = sorted.length; i < l; i++) {
			sorted[i].element.style.zIndex = `${zMax - i}`;
		}
	}

	//
	//
	// FOG
	//
	//
	set_use_fog(state: boolean) {
		this._use_fog = state;
	}
	set_fog_range(near: number, far: number) {
		this._fog_near = near;
		this._fog_far = far;
	}
}
