import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {
	FloatType,
	HalfFloatType,
	NearestFilter,
	ClampToEdgeWrapping,
	RGBAFormat,
	LinearFilter,
} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneBufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Camera} from 'three/src/cameras/Camera';
import {TypedCopNode} from './_Base';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {EffectsComposerController, PostProcessNetworkParamsConfig} from '../post/utils/EffectsComposerController';
// import {Poly} from '../../Poly';
import {Texture} from 'three/src/textures/Texture';
import {DisplayNodeController} from '../utils/DisplayNodeController';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector2} from 'three/src/math/Vector2';
import {EffectComposer} from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
	[uniform: string]: IUniform;
}

const VERTEX_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;
const FRAGMENT_SHADER = `
uniform vec2 resolution;
uniform sampler2D map;

void main() {
	vec2 uv = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y);
	vec4 map_val = texture2D(map, uv);
	gl_FragColor = vec4(map_val);
}`;

const wrapS = ClampToEdgeWrapping;
const wrapT = ClampToEdgeWrapping;

const minFilter = LinearFilter;
const magFilter = NearestFilter;
const parameters1 = {
	wrapS: wrapS,
	wrapT: wrapT,
	minFilter: minFilter,
	magFilter: magFilter,
	format: RGBAFormat,
	type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
	stencilBuffer: false,
	depthBuffer: false,
};
const parameters2 = {
	minFilter: LinearFilter,
	magFilter: LinearFilter,
	format: RGBAFormat,
	stencilBuffer: false,
};

const data_type1 = DataTextureControllerBufferType.Float32Array;
const data_type2 = DataTextureControllerBufferType.Uint8Array;

const OPTION_SETS = {
	data1: {
		data_type: data_type1,
		params: parameters1,
	},
	data2: {
		data_type: data_type2,
		params: parameters2,
	},
};
const OPTION_SET = OPTION_SETS.data2;

import {ParamConfig} from '../utils/params/ParamsConfig';
import {CopRendererController} from './utils/RendererController';
import {ParamsInitData} from '../utils/io/IOController';
// class PostCopParamsConfig extends NodeParamsConfig {
// 	use_camera_renderer = ParamConfig.BOOLEAN(0);
// }

class PostProcessCopNetworkParamsConfig extends PostProcessNetworkParamsConfig {
	use_camera_renderer = ParamConfig.BOOLEAN(0);
}

const ParamsConfig = new PostProcessCopNetworkParamsConfig();

// TODO:
// when the params of the children post nodes are updated,
// this node currently does not re-render
export class PostCopNode extends TypedCopNode<PostProcessCopNetworkParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'post';
	}

	private _texture_mesh: Mesh = new Mesh(new PlaneBufferGeometry(2, 2));
	private _texture_material: ShaderMaterial = new ShaderMaterial({
		uniforms: {
			map: {value: null},
			resolution: {value: null},
		},
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER,
	});
	private _texture_scene: Scene = new Scene();
	private _texture_camera: Camera = new Camera();
	private _render_target: WebGLRenderTarget | undefined;
	protected _composer: EffectComposer | undefined;
	private _composer_resolution: Vector2 = new Vector2();
	// private _prev_renderer_size: Vector2 = new Vector2();
	private _data_texture_controller: DataTextureController | undefined;
	private _renderer_controller: CopRendererController | undefined;

	readonly effects_composer_controller: EffectsComposerController = new EffectsComposerController(this);
	public readonly display_node_controller: DisplayNodeController = new DisplayNodeController(
		this,
		this.effects_composer_controller.display_node_controller_callbacks()
	);

	protected _children_controller_context = NodeContext.POST;
	initialize_node() {
		this.io.inputs.set_count(1);

		this.lifecycle.add_on_create_hook(() => {
			this._create_start_nodes();
		});

		// init scene
		this._texture_mesh.name = 'cop/post';
		this._texture_scene.name = 'cop/post';
		this._texture_camera.name = 'cop/post';
		this._texture_mesh.material = this._texture_material;
		this._texture_scene.add(this._texture_mesh);
		this._texture_camera.position.z = 1;

		// when receiving dirty from children
		this.dirty_controller.add_post_dirty_hook('reset', () => {
			this.reset();
		});
	}

	create_node<K extends keyof PostNodeChildrenMap>(
		type: K,
		params_init_value_overrides?: ParamsInitData
	): PostNodeChildrenMap[K] {
		return super.create_node(type, params_init_value_overrides) as PostNodeChildrenMap[K];
	}
	createNode<K extends valueof<PostNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BasePostProcessNodeType[];
	}
	nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as PostNodeChildrenMap[K][];
	}

	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this.build_effects_composer_if_required();
		this.render_on_target(texture);
	}

	build_effects_composer_if_required() {
		if (true) {
			this.build_effects_composer();
		}
	}
	private build_effects_composer() {}

	private async render_on_target(texture: Texture) {
		this._renderer_controller = this._renderer_controller || new CopRendererController(this);
		const renderer = await this._renderer_controller.renderer();

		//
		// prepare
		//
		this._renderer_controller.save_state();
		this._composer_resolution.set(texture.image.width, texture.image.height);
		this._render_target =
			this._render_target || this._create_render_target(this._composer_resolution.x, this._composer_resolution.y);
		renderer.setRenderTarget(this._render_target);
		renderer.setSize(this._composer_resolution.x, this._composer_resolution.y);

		//
		// render
		//
		// setup composer
		// console.log('this._composer_resolution', this._composer_resolution);
		this._composer = this._composer || this._create_composer(renderer, this._render_target);
		this._texture_material.uniforms.map.value = texture;
		this._texture_material.uniforms.resolution.value = this._composer_resolution;

		// renderer.clear();
		// renderer.render(this._texture_scene, this._texture_camera);
		// renderer.autoClear = false;
		this._composer.render();

		if (this.pv.use_camera_renderer) {
			this.set_texture(this._render_target.texture);
		} else {
			const data_texture = this._copy_to_data_texture(renderer, this._render_target);
			this.set_texture(data_texture);
		}

		//
		// restore renderer
		//
		this._renderer_controller.restore_state();
	}

	render_target() {
		return this._render_target;
	}

	private _copy_to_data_texture(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		this._data_texture_controller =
			this._data_texture_controller || new DataTextureController(OPTION_SET.data_type);
		const data_texture = this._data_texture_controller.from_render_target(renderer, render_target);
		// const data_texture = this._data_texture_controller.from_render_target(renderer, this._composer.writeBuffer);
		// const pixel_count = data_texture.image.data.length / 4;
		// for (let i = 0; i < pixel_count; i++) {
		// 	// data_texture.image.data[i * 4 + 0] = 255;
		// 	// data_texture.image.data[i * 4 + 1] = 125;
		// 	// data_texture.image.data[i * 4 + 2] *= 2;
		// 	// data_texture.image.data[i * 4 + 3] = 255;
		// }
		data_texture.needsUpdate = true;
		// console.log('data_texture', data_texture, data_texture.image.data.slice(0, 30));
		return data_texture;
	}

	private _create_render_target(width: number, height: number) {
		if (this._render_target) {
			const image = this._render_target.texture.image;
			if (image.width == width && image.height == height) {
				return this._render_target;
			}
		}

		var renderTarget = new WebGLRenderTarget(width, height, OPTION_SET.params);
		return renderTarget;
	}

	protected _create_composer(renderer: WebGLRenderer, render_target: WebGLRenderTarget) {
		const composer = this.effects_composer_controller.create_effects_composer({
			renderer,
			scene: this._texture_scene,
			camera: this._texture_camera,
			resolution: this._composer_resolution,
			requester: this,
		});
		composer.renderToScreen = false;
		return composer;
	}

	reset() {
		this._composer = undefined;
	}

	//
	//
	// START NODES
	//
	//
	private _create_start_nodes() {
		const null1 = this.create_node('null');
		const unreal_bloom1 = this.create_node('unreal_bloom');

		null1.set_name('OUT');
		null1.set_input(0, unreal_bloom1);
		null1.ui_data.set_position(0, 200);
		unreal_bloom1.ui_data.set_position(0, -200);

		null1.flags.display.set(true);
	}
}
