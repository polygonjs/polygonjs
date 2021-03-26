import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {Mesh} from 'three/src/objects/Mesh';
import {HorizontalBlurShader} from '../../modules/three/examples/jsm/shaders/HorizontalBlurShader';
import {VerticalBlurShader} from '../../modules/three/examples/jsm/shaders/VerticalBlurShader';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Vector2} from 'three/src/math/Vector2';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';

const PLANE_WIDTH = 1;
const PLANE_HEIGHT = 1;
const CAMERA_HEIGHT = 1;

export class CoreRenderBlur {
	private _blurPlane: Mesh;
	private _horizontalBlurMaterial: ShaderMaterial;
	private _verticalBlurMaterial: ShaderMaterial;
	private _renderTargetBlur: WebGLRenderTarget;
	private _camera: OrthographicCamera;

	constructor(private _res: Vector2) {
		this._renderTargetBlur = this._createRenderTarget(this._res);
		this._camera = this._createCamera();
		this._blurPlane = this._createBlurPlane();

		this._horizontalBlurMaterial = new ShaderMaterial(HorizontalBlurShader);
		this._horizontalBlurMaterial.depthTest = false;

		this._verticalBlurMaterial = new ShaderMaterial(VerticalBlurShader);
		this._verticalBlurMaterial.depthTest = false;
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
		// the camera to render the depth material from
		const camera = new OrthographicCamera(
			-PLANE_WIDTH / 2,
			PLANE_WIDTH / 2,
			PLANE_HEIGHT / 2,
			-PLANE_HEIGHT / 2,
			0,
			CAMERA_HEIGHT
		);
		// this._shadowCamera.rotation.z = Math.PI / 2;
		// camera.rotation.x = -Math.PI / 2; // get the camera to look down
		camera.position.z = CAMERA_HEIGHT * 0.5;

		// this._helper = new CameraHelper(this._shadowCamera);
		// this._helper.visible = false;
		// this._shadowCamera.add(this._helper);
		return camera;
	}
	private _createBlurPlane() {
		const planeGeometry = new PlaneBufferGeometry(PLANE_WIDTH, PLANE_HEIGHT); //.rotateX(-Math.PI / 2);
		const plane = new Mesh(planeGeometry);
		// plane.visible = false;
		// plane.rotateX(Math.PI);
		// plane.position.y = 0.01;
		return plane;
	}

	applyBlur(renderTarget: WebGLRenderTarget, renderer: WebGLRenderer, amount: number) {
		// this._blurPlane.visible = true;
		// return;

		// blur horizontally and draw in the renderTargetBlur
		this._horizontalBlurMaterial.uniforms.tDiffuse.value = renderTarget.texture;
		this._horizontalBlurMaterial.uniforms.h.value = amount / this._res.x;
		this._blurPlane.material = this._horizontalBlurMaterial;

		renderer.setRenderTarget(this._renderTargetBlur);
		renderer.render(this._blurPlane, this._camera);

		// blur vertically and draw in the main renderTarget
		this._verticalBlurMaterial.uniforms.tDiffuse.value = this._renderTargetBlur.texture;
		this._verticalBlurMaterial.uniforms.v.value = amount / this._res.y;
		this._blurPlane.material = this._verticalBlurMaterial;

		renderer.setRenderTarget(renderTarget);
		renderer.render(this._blurPlane, this._camera);

		// this._blurPlane.visible = false;
	}
}
