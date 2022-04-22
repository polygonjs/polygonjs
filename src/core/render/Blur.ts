import {WebGLRenderTarget} from 'three';
import {Mesh} from 'three';
import {PlaneBufferGeometry} from 'three';
import {ShaderMaterial} from 'three';
import {Vector2} from 'three';
import {WebGLRenderer} from 'three';
import {OrthographicCamera} from 'three';
import {HorizontalBlurShader} from '../../modules/three/examples/jsm/shaders/HorizontalBlurShader';
import {VerticalBlurShader} from '../../modules/three/examples/jsm/shaders/VerticalBlurShader';

const PLANE_WIDTH = 1;
const PLANE_HEIGHT = 1;
const CAMERA_HEIGHT = 1;
const BLUR_MULT = 1 / (256 * 1000);

export class CoreRenderBlur {
	private _blurPlane: Mesh;
	private _horizontalBlurMaterial: ShaderMaterial;
	private _verticalBlurMaterial: ShaderMaterial;
	private _renderTargetBlur: WebGLRenderTarget;
	private _camera: OrthographicCamera;

	constructor(res: Vector2) {
		this._renderTargetBlur = this._createRenderTarget(res);
		this._camera = this._createCamera();
		this._blurPlane = this._createBlurPlane();

		this._horizontalBlurMaterial = new ShaderMaterial(HorizontalBlurShader);
		this._horizontalBlurMaterial.depthTest = false;

		this._verticalBlurMaterial = new ShaderMaterial(VerticalBlurShader);
		this._verticalBlurMaterial.depthTest = false;
	}
	dispose() {
		this._horizontalBlurMaterial.dispose();
		this._verticalBlurMaterial.dispose();
		this._renderTargetBlur.dispose();
	}
	setSize(w: number, h: number) {
		this._renderTargetBlur.setSize(w, h);
	}

	private _createRenderTarget(res: Vector2) {
		const renderTarget = new WebGLRenderTarget(res.x, res.y);
		renderTarget.texture.generateMipmaps = false;
		return renderTarget;
	}
	private _createCamera() {
		const camera = new OrthographicCamera(
			-PLANE_WIDTH / 2,
			PLANE_WIDTH / 2,
			PLANE_HEIGHT / 2,
			-PLANE_HEIGHT / 2,
			0,
			CAMERA_HEIGHT
		);
		camera.position.z = CAMERA_HEIGHT * 0.5;
		return camera;
	}
	private _createBlurPlane() {
		const planeGeometry = new PlaneBufferGeometry(PLANE_WIDTH, PLANE_HEIGHT);
		const plane = new Mesh(planeGeometry);
		return plane;
	}

	applyBlur(renderTarget: WebGLRenderTarget, renderer: WebGLRenderer, amountH: number, amountV: number) {
		// in order to get similar amount of blur in vertical and horizontal axis,
		// we need to use the same amount for each.
		// We also use the renderTarget size to ensure that the blur remains consistent depending
		// on the screen size, which is important for the reflector.
		// A previous attempt was before to have a different amount for vertical and horizontal,
		// based on height and width respectively, but that led to non-uniform blurs.
		const mult = Math.max(this._renderTargetBlur.width, this._renderTargetBlur.height);

		// blur horizontally and draw in the renderTargetBlur
		this._horizontalBlurMaterial.uniforms.tDiffuse.value = renderTarget.texture;
		this._horizontalBlurMaterial.uniforms.h.value = amountH * mult * BLUR_MULT;
		this._blurPlane.material = this._horizontalBlurMaterial;

		renderer.setRenderTarget(this._renderTargetBlur);
		renderer.render(this._blurPlane, this._camera);

		// blur vertically and draw in the main renderTarget
		this._verticalBlurMaterial.uniforms.tDiffuse.value = this._renderTargetBlur.texture;
		this._verticalBlurMaterial.uniforms.v.value = amountV * mult * BLUR_MULT;
		this._blurPlane.material = this._verticalBlurMaterial;

		renderer.setRenderTarget(renderTarget);
		renderer.render(this._blurPlane, this._camera);
	}
}
