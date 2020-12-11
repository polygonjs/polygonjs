import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {RGBFormat} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneBufferGeometry';
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera';
import {Mesh} from 'three/src/objects/Mesh';
import {LinearFilter} from 'three/src/constants';
import {BokehShader, BokehDepthShader} from '../../three/examples/jsm/shaders/BokehShader2';

import {CoreScene} from '../../../core/geometry/Scene';

import DepthInstanceVertex from './gl/DepthInstance.vert.glsl';
import {IUniformN, IUniformTexture, IUniformV2} from '../../../engine/nodes/utils/code/gl/Uniforms';
import {Vector2} from 'three/src/math/Vector2';
import {Color} from 'three/src/math/Color';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {DepthOfFieldPostNode} from '../../../engine/nodes/post/DepthOfField';

interface BokehUniforms {
	tColor: IUniformTexture;
	tDepth: IUniformTexture;
	textureWidth: IUniformN;
	textureHeight: IUniformN;
	// public
	fstop: IUniformN;
	maxblur: IUniformN;
	threshold: IUniformN;
	gain: IUniformN;
	bias: IUniformN;
	fringe: IUniformN;
	dithering: IUniformN;
	// camera
	focalLength: IUniformN;
	znear: IUniformN;
	zfar: IUniformN;
	focalDepth: IUniformN;
	// booleans
	noise: IUniformN;
	pentagon: IUniformN;
	vignetting: IUniformN;
	depthblur: IUniformN;

	// debug
	shaderFocus: IUniformN;
	showFocus: IUniformN;
	manualdof: IUniformN;
	focusCoords: IUniformV2;

	[uniform: string]: IUniform;
}
interface CameraUniforms {
	mNear: IUniformN;
	mFar: IUniformN;
	[propName: string]: IUniform;
}

interface BokehShaderMaterial extends ShaderMaterial {
	uniforms: BokehUniforms;
	defines: {
		RINGS: number;
		SAMPLES: number;
	};
}

export class BokehPass2 {
	private _core_scene: CoreScene;
	private materialDepth: ShaderMaterial;
	private materialDepthInstance: ShaderMaterial;
	private _camera_uniforms: CameraUniforms = {mNear: {value: 0}, mFar: {value: 0}};
	// pass attributes
	public enabled: boolean = true;
	public needsSwap: boolean = true;
	public clear: boolean = true;
	public renderToScreen: boolean = true;
	// processing
	private _processing_scene: Scene = new Scene();
	private _processing_camera: OrthographicCamera;
	private _rtTextureDepth: WebGLRenderTarget;
	private _rtTextureColor: WebGLRenderTarget;
	public bokeh_uniforms: BokehUniforms;
	public bokeh_material: BokehShaderMaterial;
	private _quad: Mesh;
	public clear_color = new Color(1, 1, 1);

	constructor(
		private _depth_of_field_node: DepthOfFieldPostNode,
		private _scene: Scene,
		private _camera: PerspectiveCamera,
		private _resolution: Vector2
	) {
		this._core_scene = new CoreScene(this._scene);
		const shaderSettings = {
			rings: 3,
			samples: 4,
		};

		this._processing_camera = new OrthographicCamera(
			this._resolution.x / -2,
			this._resolution.x / 2,
			this._resolution.y / 2,
			this._resolution.y / -2,
			-10000,
			10000
		);
		this._processing_camera.position.z = 100;

		this._processing_scene.add(this._processing_camera);

		var pars = {minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat};
		this._rtTextureDepth = new WebGLRenderTarget(this._resolution.x, this._resolution.y, pars);
		this._rtTextureColor = new WebGLRenderTarget(this._resolution.x, this._resolution.y, pars);

		var bokeh_shader = BokehShader;
		if (!bokeh_shader) {
			console.error('BokehPass relies on BokehShader');
		}

		this.bokeh_uniforms = UniformsUtils.clone(bokeh_shader.uniforms);

		this.bokeh_uniforms['tColor'].value = this._rtTextureColor.texture;
		this.bokeh_uniforms['tDepth'].value = this._rtTextureDepth.texture;
		this.bokeh_uniforms['textureWidth'].value = this._resolution.x;
		this.bokeh_uniforms['textureHeight'].value = this._resolution.y;

		this.bokeh_material = new ShaderMaterial({
			uniforms: this.bokeh_uniforms,
			vertexShader: bokeh_shader.vertexShader,
			fragmentShader: bokeh_shader.fragmentShader,
			defines: {
				RINGS: shaderSettings.rings,
				SAMPLES: shaderSettings.samples,
			},
		}) as BokehShaderMaterial;

		this._quad = new Mesh(new PlaneBufferGeometry(this._resolution.x, this._resolution.y), this.bokeh_material);
		this._quad.position.z = -500;
		this._processing_scene.add(this._quad);

		// depth shader
		var depthShader = BokehDepthShader;
		if (!depthShader) {
			console.error('BokehPass relies on BokehDepthShader');
		}

		this.materialDepth = new ShaderMaterial({
			uniforms: depthShader.uniforms,
			vertexShader: depthShader.vertexShader,
			fragmentShader: depthShader.fragmentShader,
		});

		// add a shader similar to this.materialDepth, but that works with instances
		this.materialDepthInstance = new ShaderMaterial({
			uniforms: depthShader.uniforms,
			vertexShader: DepthInstanceVertex,
			fragmentShader: depthShader.fragmentShader,
		});

		this.update_camera_uniforms_with_node(this._depth_of_field_node, this._camera);
	}

	setSize(width: number, height: number) {
		this._rtTextureDepth.setSize(width, height);
		this._rtTextureColor.setSize(width, height);

		this.bokeh_uniforms['textureWidth'].value = width;
		this.bokeh_uniforms['textureHeight'].value = height;
	}

	dispose() {
		this._rtTextureDepth.dispose();
		this._rtTextureColor.dispose();
	}

	render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget) {
		const debug_display_depth = false;
		const prev_clear_color = renderer.getClearColor();
		renderer.setClearColor(this.clear_color);

		// TODO: try and make this work so it can be combined with other POST nodes
		// check how ShaderPass.js has implemented it
		renderer.clear();

		// render scene into texture

		renderer.setRenderTarget(this._rtTextureColor);
		renderer.clear();
		renderer.render(this._scene, this._camera);
		renderer.setClearColor(0x000000); // cancels the bg color

		// render depth into texture
		this._core_scene.with_overriden_material(
			this.materialDepth,
			this.materialDepthInstance,
			this._camera_uniforms,
			() => {
				if (debug_display_depth) {
					renderer.setRenderTarget(null);
				} else {
					renderer.setRenderTarget(this._rtTextureDepth);
				}
				renderer.clear();
				renderer.render(this._scene, this._camera);
			}
		);
		// render bokeh composite

		if (!debug_display_depth) {
			renderer.setRenderTarget(null);
			renderer.clear();
			renderer.render(this._processing_scene, this._processing_camera);
		}

		renderer.setClearColor(prev_clear_color);
	}

	update_camera_uniforms_with_node(node: DepthOfFieldPostNode, camera: PerspectiveCamera) {
		// from camera
		this.bokeh_uniforms['focalLength'].value = camera.getFocalLength();
		this.bokeh_uniforms['znear'].value = camera.near;
		this.bokeh_uniforms['zfar'].value = camera.far;

		// focal length
		var sdistance = DepthOfFieldPostNode.smoothstep(camera.near, camera.far, node.pv.focal_depth);
		var ldistance = DepthOfFieldPostNode.linearize(1 - sdistance, camera.near, camera.far);
		this.bokeh_uniforms['focalDepth'].value = ldistance; //this._param_focal_depth

		// depth materials
		this._camera_uniforms = {
			mNear: {value: camera.near},
			mFar: {value: camera.far},
		};
		for (let material of [this.materialDepth, this.materialDepthInstance]) {
			material.uniforms['mNear'].value = this._camera_uniforms['mNear'].value;
			material.uniforms['mFar'].value = this._camera_uniforms['mFar'].value;
		}
	}
}
