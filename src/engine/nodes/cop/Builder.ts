import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {RGBAFormat} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {NearestFilter} from 'three/src/constants';
import {Mesh} from 'three/src/objects/Mesh';
import {HalfFloatType} from 'three/src/constants';
import {FloatType} from 'three/src/constants';
import {DataTexture} from 'three/src/textures/DataTexture';
import {ClampToEdgeWrapping} from 'three/src/constants';
import {Camera} from 'three/src/cameras/Camera';

// import NodeBase from '../_Base'

// import Container from '../../Container/Texture'
// import {CoreImage} from '../../../Core/Image'

import {TypedCopNode} from './_Base';

// import { GlobalsGeometryHandler } from "src/Engine/Node/Gl/Assembler/Globals/Geometry";
import {GlAssemblerController} from '../gl/code/Controller';
import {ShaderAssemblerTexture} from '../gl/code/assemblers/textures/Texture';

import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
	[uniform: string]: IUniform;
}

const PASS_THROUGH_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {GlobalsGeometryHandler} from '../gl/code/globals/Geometry';
import {GlNodeChildrenMap} from '../../poly/registers/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {GlNodeFinder} from '../gl/code/utils/NodeFinder';
import {NodeContext} from '../../poly/NodeContext';
import {CoreSleep} from '../../../core/Sleep';
class BuilderCopParamsConfig extends NodeParamsConfig {
	resolution = ParamConfig.VECTOR2([256, 256]);
}

const ParamsConfig = new BuilderCopParamsConfig();

export class BuilderCopNode extends TypedCopNode<BuilderCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'builder';
	}
	protected _assembler_controller: GlAssemblerController<
		ShaderAssemblerTexture
	> = this._create_assembler_controller();

	private _create_assembler_controller() {
		const globals_handler = new GlobalsGeometryHandler();
		const assembler_controller = new GlAssemblerController<ShaderAssemblerTexture>(this, ShaderAssemblerTexture);
		assembler_controller.set_assembler_globals_handler(globals_handler);
		return assembler_controller;
	}

	get assembler_controller() {
		return this._assembler_controller;
	}

	private _texture_mesh: Mesh = new Mesh(new PlaneBufferGeometry(2, 2));
	private _fragment_shader: string | undefined;
	private _uniforms: IUniforms | undefined;
	private _texture_material: ShaderMaterial = new ShaderMaterial({
		uniforms: {},
		vertexShader: PASS_THROUGH_SHADER,
		fragmentShader: '',
	});
	private _texture_scene: Scene = new Scene();
	private _texture_camera: Camera = new Camera();
	private _render_target: WebGLRenderTarget | undefined;
	private _renderer: WebGLRenderer | undefined;
	private _pixelBuffer: Float32Array | undefined;
	// private _assembler: ShaderAssemblerTexture;

	protected _children_controller_context = NodeContext.GL;
	initialize_node() {
		this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		this.children_controller?.init();
		this._texture_mesh.material = this._texture_material;
		this._texture_scene.add(this._texture_mesh);
		this._texture_camera.position.z = 1;

		// this._init_common_shader_builder(ShaderAssemblerTexture, {
		// 	has_display_flag: true
		// });
		// this.set_inputs_count_to_zero();

		this.dirty_controller.add_post_dirty_hook(
			'_reset_if_resolution_changed',
			this._reset_if_resolution_changed.bind(this)
		);
		this.params.set_post_create_params_hook(() => {
			this._render_target = this._create_render_target();
			this._renderer = this._create_renderer(this._render_target);
		});
	}

	create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K] {
		return super.create_node(type) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}

	private _reset_if_resolution_changed(trigger?: CoreGraphNode) {
		if (trigger && trigger.graph_node_id == this.p.resolution.graph_node_id) {
			this._reset();
		}
	}
	private _reset() {
		this._render_target = this._create_render_target();
		this._renderer = this._create_renderer(this._render_target);
		this._pixelBuffer = this._create_pixel_buffer();
	}
	private _create_pixel_buffer() {
		const width = this.pv.resolution.x;
		const height = this.pv.resolution.y;
		return new Float32Array(width * height * 4);
	}

	async cook() {
		await this.compile_if_required();
		// await this.assembler_controller.assign_uniform_values();

		this.render_on_target();
	}

	shaders_by_name() {
		return {
			fragment: this._fragment_shader,
		};
	}

	async compile_if_required() {
		if (this.assembler_controller.compile_required()) {
			// && !this.pv.locked){
			// this._texture_material = undefined;
			await this.run_assembler();
			// const fragment_shader = this.assembler_controller.assembler.fragment_shader();
			// const uniforms = this.assembler_controller.assembler.uniforms();
			// if (fragment_shader && uniforms) {
			// 	// await this.eval_params(this._new_params);
			// 	this._fragment_shader = fragment_shader;
			// 	this._uniforms = uniforms;
			// } else {
			// 	throw 'STOP';
			// }
			this.assembler_controller.post_compile();
		}
	}
	private async run_assembler() {
		const output_nodes = GlNodeFinder.find_output_nodes(this);
		if (output_nodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const output_node = output_nodes[0];
		if (output_node) {
			this.assembler_controller.assembler.set_root_nodes([output_node]);

			// main compilation
			await this.assembler_controller.assembler.update_fragment_shader();

			// receives fragment and uniforms
			const fragment_shader = this.assembler_controller.assembler.fragment_shader();
			const uniforms = this.assembler_controller.assembler.uniforms();
			if (fragment_shader && uniforms) {
				this._fragment_shader = fragment_shader;
				this._uniforms = uniforms;
			}

			// TODO: remove this once the scene knows how to re-render
			// the render target if it is .uniforms_time_dependent()
			if (this.assembler_controller.assembler.uniforms_time_dependent()) {
				this.states.time_dependent.force_time_dependent();
			} else {
				this.states.time_dependent.unforce_time_dependent();
			}
		}

		if (this._fragment_shader && this._uniforms) {
			this._texture_material.fragmentShader = this._fragment_shader;
			this._texture_material.uniforms = this._uniforms;
			this._texture_material.needsUpdate = true;
			this._texture_material.uniforms.resolution = {
				value: this.pv.resolution,
			};
		}

		// this._compile_required = false;
	}

	private _create_renderer(render_target: WebGLRenderTarget) {
		const renderer = new WebGLRenderer({antialias: true});
		renderer.setPixelRatio(window.devicePixelRatio);
		// document.body.appendChild( renderer.domElement )
		renderer.autoClear = false;

		renderer.setRenderTarget(render_target);

		return renderer;
	}

	async render_on_target() {
		const width = this.pv.resolution.x;
		const height = this.pv.resolution.y;

		// var passThruUniforms = {
		// 	passThruTexture: { value: null }
		// };

		if (!(this._renderer && this._render_target)) {
			return;
		}
		this._renderer.clear();
		this._renderer.render(this._texture_scene, this._texture_camera);
		// renderer.setClearColor( 0x000000 ) // cancels the bg color

		//read the pixel
		this._pixelBuffer = this._pixelBuffer || this._create_pixel_buffer();
		this._renderer.readRenderTargetPixels(this._render_target, 0, 0, width, height, this._pixelBuffer);

		// renderer.setRenderTarget( null );

		// var pixelBuffer2 = new Uint8Array( width * height * 4 );
		// var pixelBuffer2 = Uint8Array.from(pixelBuffer)

		// be careful about the type FloatType
		// as this may require webgl extensions
		// see https://threejs.org/docs/#api/en/textures/DataTexture
		const texture = new DataTexture(this._pixelBuffer, width, height, RGBAFormat, FloatType);
		// // texture.wrapS = ClampToEdgeWrapping
		// // texture.wrapT = ClampToEdgeWrapping
		// // texture.wrapS = ClampToEdgeWrapping
		// // texture.wrapT = ClampToEdgeWrapping
		// this._texture.needsUpdate = true;

		await CoreSleep.sleep(2000);

		if (texture) {
			this.set_texture(texture);
		} else {
			this.cook_controller.end_cook();
		}

		// this.set_texture(this._texture);
		// this.cook_controller.end_cook();
	}

	private _create_render_target() {
		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = NearestFilter;
		const magFilter = NearestFilter;

		var renderTarget = new WebGLRenderTarget(this.pv.resolution.x, this.pv.resolution.y, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
			format: RGBAFormat,
			type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
			stencilBuffer: false,
			depthBuffer: false,
		});
		return renderTarget;
	}

	// create_material(fragment_shader:string, uniforms:IUniforms) {
	// 	var material = new ShaderMaterial({
	// 		uniforms: uniforms,
	// 		vertexShader: PASS_THROUGH_SHADER,
	// 		fragmentShader: fragment_shader
	// 	});

	// 	// addResolutionDefine( material );

	// 	return material;
	// }
}
