// import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
// import { WebGLRenderTarget } from "three/src/renderers/WebGLRenderTarget";
// import { Vector2 } from "three/src/math/Vector2";
// import { ShaderMaterial } from "three/src/materials/ShaderMaterial";
// import { Scene } from "three/src/scenes/Scene";
// import { RGBAFormat } from "three/src/constants";
// import { PlaneBufferGeometry } from "three/src/geometries/PlaneGeometry";
// import { NearestFilter } from "three/src/constants";
// import { Mesh } from "three/src/objects/Mesh";
// import { HalfFloatType } from "three/src/constants";
// import { FloatType } from "three/src/constants";
// import { DataTexture } from "three/src/textures/DataTexture";
// import { ClampToEdgeWrapping } from "three/src/constants";
// import { Camera } from "three/src/cameras/Camera";
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
// 	WebGLRenderer
// };
// // import NodeBase from '../_Base'

// // import Container from '../../Container/Texture'
// import { ParamType } from "src/Engine/Param/_Module";
// // import {CoreImage} from 'src/Core/Image'
// import { ThreeToGl } from "src/Core/ThreeToGl";

// import { BaseNodeCop } from "./_Base";

// import { AssemblerOwner } from "src/Engine/Node/Gl/Assembler/Owner";
// import { ShaderAssemblerTexture } from "src/Engine/Node/Gl/Assembler/Texture";
// import { GlobalsGeometryHandler } from "src/Engine/Node/Gl/Assembler/Globals/Geometry";

// const PASS_THROUGH_SHADER = `
// void main()	{
// 	gl_Position = vec4( position, 1.0 );
// }
// `;

// export class Builder extends AssemblerOwner(BaseNodeCop) {
// 	static type() {
// 		return "builder";
// 	}

// 	private _param_resolution: THREE.Vector2;

// 	private _texture_scene: THREE.Scene;
// 	private _texture_camera: THREE.Camera;
// 	private _fragment_shader: string;
// 	private _assembler: ShaderAssemblerTexture;

// 	constructor() {
// 		super();

// 		this._init_common_shader_builder(ShaderAssemblerTexture, {
// 			has_display_flag: true
// 		});
// 		this.set_inputs_count_to_zero();
// 	}

// 	create_params() {
// 		this.add_param(ParamType.VECTOR2, "resolution", [256, 256]);
// 	}

// 	async cook() {
// 		await this.compile_if_required();

// 		this.render_on_target();
// 	}

// 	shaders_by_name() {
// 		return {
// 			fragment: this._fragment_shader
// 		};
// 	}

// 	async compile_if_required() {
// 		if (this.compile_required()) {
// 			// && !this._param_locked){
// 			this._texture_material = null;
// 			await this.run_assembler();
// 			const fragment_shader = this._assembler.fragment_shader();
// 			const uniforms = this._assembler.uniforms();
// 			if (fragment_shader) {
// 				await this.eval_params(this._new_params);
// 				this._fragment_shader = fragment_shader;
// 				this._uniforms = uniforms;
// 			} else {
// 				console.warn("no fragment_shader from assembler");
// 			}
// 		}
// 		await this.assign_uniform_values();
// 	}
// 	private async run_assembler() {
// 		const output_node = this._find_output_node();
// 		if (output_node) {
// 			const globals_handler = new GlobalsGeometryHandler();
// 			this.set_assembler_globals_handler(globals_handler);
// 			this._assembler.set_root_nodes([output_node]);

// 			await this._assembler.update_fragment_shader();
// 			this.create_spare_parameters();

// 			if (this._assembler.frame_dependent()) {
// 				this._force_time_dependent();
// 			} else {
// 				this._unforce_time_dependent();
// 			}
// 		}

// 		this._compile_required = false;
// 	}

// 	private create_renderer(render_target) {
// 		const renderer = new THREE.WebGLRenderer({ antialias: true });
// 		renderer.setPixelRatio(window.devicePixelRatio);
// 		// document.body.appendChild( renderer.domElement )
// 		renderer.autoClear = false;

// 		renderer.setRenderTarget(render_target);

// 		return renderer;
// 	}

// 	render_on_target() {
// 		const width = this._param_resolution.x;
// 		const height = this._param_resolution.y;

// 		this._texture_scene = this._texture_scene || new THREE.Scene();
// 		this._texture_camera = this._texture_camera || new THREE.Camera();
// 		this._texture_camera.position.z = 1;
// 		var passThruUniforms = {
// 			passThruTexture: { value: null }
// 		};
// 		this._texture_material =
// 			this._texture_material ||
// 			this.create_material(this._fragment_shader, this._uniforms);
// 		this._texture_material.uniforms.resolution = {
// 			value: this._param_resolution
// 		};
// 		this._texture_mesh =
// 			this._texture_mesh ||
// 			new THREE.Mesh(
// 				new THREE.PlaneBufferGeometry(2, 2),
// 				this._texture_material
// 			);
// 		this._texture_mesh.material = this._texture_material;
// 		this._texture_scene.add(this._texture_mesh);

// 		this._render_target =
// 			this._render_target || this.create_render_target();
// 		this._renderer =
// 			this._renderer || this.create_renderer(this._render_target); //POLY.renderers_controller.first_renderer()
// 		// if(!renderer){
// 		// 	console.warn(`${this.full_path()} found no renderer`)
// 		// }

// 		this._renderer.clear();
// 		this._renderer.render(this._texture_scene, this._texture_camera);
// 		// renderer.setClearColor( 0x000000 ) // cancels the bg color

// 		this._pixelBuffer =
// 			this._pixelBuffer || new Float32Array(width * height * 4);
// 		//read the pixel
// 		this._renderer.readRenderTargetPixels(
// 			this._render_target,
// 			0,
// 			0,
// 			width,
// 			height,
// 			this._pixelBuffer
// 		);

// 		// renderer.setRenderTarget( null );

// 		// var pixelBuffer2 = new Uint8Array( width * height * 4 );
// 		// var pixelBuffer2 = Uint8Array.from(pixelBuffer)

// 		// be careful about the type THREE.FloatType
// 		// as this may require webgl extensions
// 		// see https://threejs.org/docs/#api/en/textures/DataTexture
// 		this._texture =
// 			this._texture ||
// 			new THREE.DataTexture(
// 				this._pixelBuffer,
// 				width,
// 				height,
// 				THREE.RGBAFormat,
// 				THREE.FloatType
// 			);
// 		// // texture.wrapS = THREE.ClampToEdgeWrapping
// 		// // texture.wrapT = THREE.ClampToEdgeWrapping
// 		// // texture.wrapS = THREE.ClampToEdgeWrapping
// 		// // texture.wrapT = THREE.ClampToEdgeWrapping
// 		this._texture.needsUpdate = true;

// 		this.set_texture(this._texture);
// 	}

// 	create_render_target() {
// 		const wrapS = THREE.ClampToEdgeWrapping;
// 		const wrapT = THREE.ClampToEdgeWrapping;

// 		const minFilter = THREE.NearestFilter;
// 		const magFilter = THREE.NearestFilter;

// 		var renderTarget = new THREE.WebGLRenderTarget(
// 			this._param_resolution.x,
// 			this._param_resolution.y,
// 			{
// 				wrapS: wrapS,
// 				wrapT: wrapT,
// 				minFilter: minFilter,
// 				magFilter: magFilter,
// 				format: THREE.RGBAFormat,
// 				type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
// 					? THREE.HalfFloatType
// 					: THREE.FloatType,
// 				stencilBuffer: false,
// 				depthBuffer: false
// 			}
// 		);
// 		return renderTarget;
// 	}

// 	create_material(fragment_shader, uniforms) {
// 		var material = new THREE.ShaderMaterial({
// 			uniforms: uniforms,
// 			vertexShader: PASS_THROUGH_SHADER,
// 			fragmentShader: fragment_shader
// 		});

// 		// addResolutionDefine( material );

// 		return material;
// 	}
// }
