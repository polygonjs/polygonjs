// import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
// import {Vector2} from 'three/src/math/Vector2';
// import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
// import {Scene} from 'three/src/scenes/Scene';
// import {RGBAFormat} from 'three/src/constants';
// import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
// import {NearestFilter} from 'three/src/constants';
// import {Mesh} from 'three/src/objects/Mesh';
// import {HalfFloatType} from 'three/src/constants';
// import {FloatType} from 'three/src/constants';
// import {DataTexture} from 'three/src/textures/DataTexture';
// import {ClampToEdgeWrapping} from 'three/src/constants';
// import {Camera} from 'three/src/cameras/Camera';
// const THREE = {
// 	Camera,
// 	ClampToEdgeWrapping,
// 	DataTexture,
// 	FloatType,
// 	HalfFloatType,
// 	Mesh,
// 	NearestFilter,
// 	PlaneBufferGeometry,
// 	RGBAFormat,
// 	Scene,
// 	ShaderMaterial,
// 	Vector2,
// 	WebGLRenderTarget,
// };
// // import NodeBase from '../_Base'

// // import Container from '../../Container/Texture'
// // import {CoreImage} from '../../../Core/Image'
// import {ThreeToGl} from '../../../Core/ThreeToGl';

// import {BaseNodeCop} from './_Base';

// export class Color extends BaseNodeCop {
// 	static type() {
// 		return 'color';
// 	}

// 	private _param_resolution: Vector2;

// 	initialize_node() {
// 		super();

// 		this.set_inputs_count_to_zero();
// 	}

// 	create_params() {
// 		this.add_param(ParamType.COLOR, 'color', [1, 1, 1]);
// 		this.add_param(ParamType.VECTOR2, 'resolution', [256, 256]);
// 	}

// 	// TODO: typescript: that's wayyy too complicated
// 	// I should be able to just fill up an array for a DataTexture
// 	cook() {
// 		const width = this._param_resolution.x;
// 		const height = this._param_resolution.y;

// 		this._texture_scene = new Scene();
// 		var camera = new Camera();
// 		camera.position.z = 1;
// 		var passThruUniforms = {
// 			passThruTexture: {value: null},
// 		};
// 		var passThruShader = this.createShaderMaterial(this.getRedFragmentShader(), passThruUniforms);
// 		var mesh = new Mesh(new PlaneBufferGeometry(2, 2), passThruShader);
// 		this._texture_scene.add(mesh);
// 		const render_target = this.create_render_target();
// 		const renderer = POLY.renderers_controller.first_renderer();
// 		if (!renderer) {
// 			console.warn(`${this.full_path()} found no renderer`);
// 		}

// 		renderer.setRenderTarget(render_target);
// 		renderer.clear();
// 		renderer.render(this._texture_scene, camera);
// 		// renderer.setClearColor( 0x000000 ) // cancels the bg color

// 		var pixelBuffer = new Float32Array(width * height * 4);
// 		//read the pixel
// 		renderer.readRenderTargetPixels(render_target, 0, 0, width, height, pixelBuffer);

// 		renderer.setRenderTarget(null);

// 		const texture = new DataTexture(pixelBuffer, width, height, RGBAFormat);
// 		// // texture.wrapS = ClampToEdgeWrapping
// 		// // texture.wrapT = ClampToEdgeWrapping
// 		// // texture.wrapS = ClampToEdgeWrapping
// 		// // texture.wrapT = ClampToEdgeWrapping
// 		texture.needsUpdate = true;

// 		this.set_texture(texture);
// 	}

// 	create_render_target() {
// 		const wrapS = ClampToEdgeWrapping;
// 		const wrapT = ClampToEdgeWrapping;

// 		const minFilter = NearestFilter;
// 		const magFilter = NearestFilter;

// 		var renderTarget = new WebGLRenderTarget(this._param_resolution.x, this._param_resolution.y, {
// 			wrapS: wrapS,
// 			wrapT: wrapT,
// 			minFilter: minFilter,
// 			magFilter: magFilter,
// 			format: RGBAFormat,
// 			type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
// 			stencilBuffer: false,
// 			depthBuffer: false,
// 		});
// 		return renderTarget;
// 	}

// 	createShaderMaterial(computeFragmentShader, uniforms) {
// 		uniforms = uniforms || {};

// 		var material = new ShaderMaterial({
// 			uniforms: uniforms,
// 			vertexShader: this.getPassThroughVertexShader(),
// 			fragmentShader: computeFragmentShader,
// 		});

// 		// addResolutionDefine( material );

// 		return material;
// 	}
// 	getPassThroughVertexShader() {
// 		return 'void main()	{\n' + '\n' + '	gl_Position = vec4( position, 1.0 );\n' + '\n' + '}\n';
// 	}
// 	getRedFragmentShader() {
// 		return (
// 			'uniform sampler2D passThruTexture;\n' +
// 			'\n' +
// 			'void main() {\n' +
// 			'\n' +
// 			`	gl_FragColor = vec4( ${ThreeToGl.float(this._param_color.r)}, ${ThreeToGl.float(
// 				this._param_color.g
// 			)}, ${ThreeToGl.float(this._param_color.b)}, 1.0 );\n` +
// 			'\n' +
// 			'}\n'
// 		);
// 	}
// 	getPassThroughFragmentShader() {
// 		return (
// 			'uniform sampler2D passThruTexture;\n' +
// 			'\n' +
// 			'void main() {\n' +
// 			'\n' +
// 			'	vec2 uv = gl_FragCoord.xy / resolution.xy;\n' +
// 			'\n' +
// 			'	gl_FragColor = texture2D( passThruTexture, uv );\n' +
// 			'\n' +
// 			'}\n'
// 		);
// 	}
// }
