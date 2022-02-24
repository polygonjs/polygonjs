// converted to typescript from:
// https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/Reflector.js

// import {LinearFilter} from 'three/src/constants';
// import {isPowerOfTwo} from 'three/src/math/MathUtils';
import {Matrix4} from 'three/src/math/Matrix4';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {Plane} from 'three/src/math/Plane';
import {LinearFilter} from 'three/src/constants';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {WebGLRenderTarget, WebGLRenderTargetOptions} from 'three/src/renderers/WebGLRenderTarget';
import {WebGLMultisampleRenderTarget} from 'three/src/renderers/WebGLMultisampleRenderTarget';
import {Mesh} from 'three/src/objects/Mesh';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Object3D} from 'three/src/core/Object3D';
import {Camera} from 'three/src/cameras/Camera';
import {Scene} from 'three/src/scenes/Scene';
import {CoreRenderBlur} from '../../../core/render/Blur';
import {Vector2} from 'three/src/math/Vector2';
import {isBooleanTrue} from '../../../core/Type';
import {Material} from 'three/src/materials/Material';
import {CoreTransform} from '../../../core/Transform';
import {Poly} from '../../../engine/Poly';

export interface BaseReflectorOptions {
	// color: Color;
	// opacity: number;
	renderer?: WebGLRenderer;
	pixelRatio: number;
	multisamples: number;
	clipBias: number;
	active: boolean;
	tblur: boolean;
	blur: number;
	verticalBlurMult: number;
	tblur2: boolean;
	blur2: number;
	verticalBlur2Mult: number;
	scene: Scene;
}

export const renderTargetParams: WebGLRenderTargetOptions = {
	minFilter: LinearFilter,
	magFilter: LinearFilter,
	// format: RGBAFormat,
	// encoding: LinearEncoding,
};

export abstract class BaseReflector<TGeometry extends BufferGeometry, TMaterial extends Material> extends Mesh<
	TGeometry,
	TMaterial
> {
	static DEFAULT_UP = new Vector3(0, 0, 1);
	public override type = 'BaseReflector';

	private reflectorPlane = new Plane();
	private normal = new Vector3();
	private reflectorWorldPosition = new Vector3();
	private cameraWorldPosition = new Vector3();
	private rotationMatrix = new Matrix4();
	private lookAtPosition = new Vector3(0, 0, -1);
	private clipPlane = new Vector4();

	private view = new Vector3();
	private target = new Vector3();
	private q = new Vector4();

	protected textureMatrix = new Matrix4();
	private virtualCamera = new PerspectiveCamera();

	protected renderTarget: WebGLRenderTarget | WebGLMultisampleRenderTarget | undefined;
	public override material: TMaterial = this._createMaterial();
	protected _coreRenderBlur: CoreRenderBlur | undefined;

	public override onBeforeRender = this._onBeforeRender.bind(this);
	protected _mirrorCameraMultipliedByMatrixWorld = true;

	constructor(public override geometry: TGeometry, protected _options: BaseReflectorOptions) {
		super(geometry);

		if (this._options.renderer) {
			this._createRenderTarget(this._options.renderer);
		}

		this._addWindowResizeEvent();
	}
	private _createRenderTarget(renderer: WebGLRenderer) {
		const {width, height} = this._getRendererSize(renderer);

		if (this._options.multisamples > 0) {
			this.renderTarget = Poly.renderersController.renderTarget(width, height, renderTargetParams);
			if (this.renderTarget instanceof WebGLMultisampleRenderTarget) {
				this.renderTarget.samples = this._options.multisamples;
			}
		} else {
			this.renderTarget = new WebGLRenderTarget(width, height, renderTargetParams);
		}
		this._assignMaterialRenderTarget();

		this._coreRenderBlur = new CoreRenderBlur(new Vector2(width, height));
	}

	protected abstract _createMaterial(): TMaterial;
	protected abstract _assignMaterialRenderTarget(): void;

	dispose() {
		this.geometry.dispose();
		this.renderTarget?.dispose();
		this.material?.dispose();
		this.onBeforeRender = () => {};
		this._removeWindowResizeEvent();
	}

	private _onWindowResizeBound = this._onWindowResize.bind(this);
	private _addWindowResizeEvent() {
		window.addEventListener('resize', this._onWindowResizeBound.bind(this), false);
	}
	private _removeWindowResizeEvent() {
		window.removeEventListener('resize', this._onWindowResizeBound.bind(this), false);
	}

	private _onWindowResize() {
		// if the object has been detached, we remove the event
		// TODO: it should be added back when the object is added to the hierarchy
		this.traverseAncestors((object) => {
			if (!object.parent) {
				if (object.uuid != this._options.scene.uuid) {
					this._removeWindowResizeEvent();
				}
			}
		});

		const renderer = this._options.renderer;
		if (renderer) {
			const {width, height} = this._getRendererSize(renderer);

			this.renderTarget?.setSize(width, height);
			this._coreRenderBlur?.setSize(width, height);
		}
	}

	private _getRendererSize(renderer: WebGLRenderer) {
		const canvas = renderer.domElement;
		const width = canvas.width * this._options.pixelRatio;
		const height = canvas.height * this._options.pixelRatio;
		return {width, height};
	}

	private static _coreTransform = new CoreTransform();
	static rotateGeometry(geometry: BufferGeometry, direction: Vector3) {
		this._coreTransform.rotateGeometry(geometry, direction, this.DEFAULT_UP);
	}
	static compensateGeometryRotation(object: Object3D, direction: Vector3) {
		this._coreTransform.rotateObject(object, this.DEFAULT_UP, direction);
	}

	protected _onBeforeRender(
		renderer: WebGLRenderer,
		scene: Scene,
		anyCamera: Camera
		// geometry: BufferGeometry,
		// material: Material,
		// group: Group
	) {
		if (!this._options.active) {
			return;
		}
		if (!this.renderTarget) {
			this._createRenderTarget(renderer);
		}
		if (!(this.renderTarget && this._coreRenderBlur)) {
			return;
		}

		const camera = anyCamera as PerspectiveCamera;

		this.reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld);
		this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

		this.rotationMatrix.extractRotation(this.matrixWorld);

		this.normal.set(0, 0, 1);
		this.normal.applyMatrix4(this.rotationMatrix);

		this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);

		// Avoid rendering when reflector is facing away

		if (this.view.dot(this.normal) > 0) return;

		this.view.reflect(this.normal).negate();
		this.view.add(this.reflectorWorldPosition);

		this.rotationMatrix.extractRotation(camera.matrixWorld);

		this.lookAtPosition.set(0, 0, -1);
		this.lookAtPosition.applyMatrix4(this.rotationMatrix);
		this.lookAtPosition.add(this.cameraWorldPosition);

		this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition);
		this.target.reflect(this.normal).negate();
		this.target.add(this.reflectorWorldPosition);

		this.virtualCamera.position.copy(this.view);
		this.virtualCamera.up.set(0, 1, 0);
		this.virtualCamera.up.applyMatrix4(this.rotationMatrix);
		this.virtualCamera.up.reflect(this.normal);
		this.virtualCamera.lookAt(this.target);

		this.virtualCamera.far = camera.far; // Used in WebGLBackground

		this.virtualCamera.updateMatrixWorld();
		this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

		// Update the texture matrix
		this.textureMatrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
		this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
		this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
		if (this._mirrorCameraMultipliedByMatrixWorld) {
			this.textureMatrix.multiply(this.matrixWorld);
		}

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
		this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition);
		this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);

		this.clipPlane.set(
			this.reflectorPlane.normal.x,
			this.reflectorPlane.normal.y,
			this.reflectorPlane.normal.z,
			this.reflectorPlane.constant
		);

		var projectionMatrix = this.virtualCamera.projectionMatrix;

		this.q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
		this.q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
		this.q.z = -1.0;
		this.q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

		// Calculate the scaled plane vector
		this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[2] = this.clipPlane.x;
		projectionMatrix.elements[6] = this.clipPlane.y;
		projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this._options.clipBias;
		projectionMatrix.elements[14] = this.clipPlane.w;

		// Render

		this.renderTarget.texture.encoding = renderer.outputEncoding;

		this.visible = false;

		var currentRenderTarget = renderer.getRenderTarget();

		var currentXrEnabled = renderer.xr.enabled;
		var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

		renderer.xr.enabled = false; // Avoid camera modification
		renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

		renderer.setRenderTarget(this.renderTarget);

		renderer.state.buffers.depth.setMask(true); // make sure the depth buffer is writable so it can be properly cleared, see #18897

		if (renderer.autoClear === false) renderer.clear();
		renderer.render(scene, this.virtualCamera);

		if (isBooleanTrue(this._options.tblur)) {
			const blurAmount = this._options.blur * this._options.pixelRatio;
			const verticalBlurAmount = blurAmount * this._options.verticalBlurMult;
			this._coreRenderBlur.applyBlur(this.renderTarget, renderer, blurAmount, verticalBlurAmount);
			if (isBooleanTrue(this._options.tblur2)) {
				const blurAmount2 = this._options.blur2 * this._options.pixelRatio;
				const verticalBlurAmount2 = blurAmount2 * this._options.verticalBlur2Mult;
				this._coreRenderBlur.applyBlur(this.renderTarget, renderer, blurAmount2, verticalBlurAmount2);
			}
		}

		renderer.xr.enabled = currentXrEnabled;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

		renderer.setRenderTarget(currentRenderTarget);

		// Restore viewport

		var viewport = (camera as any).viewport;

		if (viewport !== undefined) {
			renderer.state.viewport(viewport);
		}

		this.visible = true;
	}
}
