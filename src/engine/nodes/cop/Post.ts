import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Scene} from 'three/src/scenes/Scene';
import {
	FloatType,
	HalfFloatType,
	RGBAFormat,
	NearestFilter,
	LinearFilter,
	ClampToEdgeWrapping,
} from 'three/src/constants';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Camera} from 'three/src/cameras/Camera';
import {TypedCopNode} from './_Base';
import {PostNodeChildrenMap} from '../../poly/registers/nodes/Post';
import {BasePostProcessNodeType} from '../post/_Base';
import {NodeContext} from '../../poly/NodeContext';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
export interface IUniforms {
	[uniform: string]: IUniform;
}
import {Poly} from '../../Poly';
import {Texture} from 'three/src/textures/Texture';

const VERTEX_SHADER = `
void main()	{
	gl_Position = vec4( position, 1.0 );
}
`;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class PostCopParamsConfig extends NodeParamsConfig {
	use_data_texture = ParamConfig.BOOLEAN(1);
}

const ParamsConfig = new PostCopParamsConfig();

export class PostCopNode extends TypedCopNode<PostCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'post';
	}

	private _texture_mesh: Mesh = new Mesh(new PlaneBufferGeometry(2, 2));
	private _texture_material: ShaderMaterial = new ShaderMaterial({
		uniforms: {},
		vertexShader: VERTEX_SHADER,
		fragmentShader: '',
	});
	private _texture_scene: Scene = new Scene();
	private _texture_camera: Camera = new Camera();
	private _render_target: WebGLRenderTarget | undefined;

	protected _children_controller_context = NodeContext.POST;
	initialize_node() {
		this.lifecycle.add_on_create_hook(() => {
			this._create_start_nodes();
		});
		this.children_controller?.init();
		this._texture_mesh.material = this._texture_material;
		this._texture_scene.add(this._texture_mesh);
		this._texture_camera.position.z = 1;

		// this ensures the builder recooks when its children are changed
		// and not just when a material that use it requests it
		this.add_post_dirty_hook('_cook_main_without_inputs_when_dirty', () => {
			setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
		});

		this.params.set_post_create_params_hook(() => {
			this._reset();
		});
	}

	create_node<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K] {
		return super.create_node(type) as PostNodeChildrenMap[K];
	}
	children() {
		return super.children() as BasePostProcessNodeType[];
	}
	nodes_by_type<K extends keyof PostNodeChildrenMap>(type: K): PostNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as PostNodeChildrenMap[K][];
	}

	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cook_controller.cook_main_without_inputs();
	}

	private _reset() {
		this._render_target = undefined;
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

	async render_on_target(texture: Texture) {
		if (!this._render_target) {
			return;
		}
		// keep in mind that this only works with a single renderer
		let renderer = Poly.instance().renderers_controller.first_renderer();
		if (!renderer) {
			renderer = await Poly.instance().renderers_controller.wait_for_renderer();
		}
		const prev_target = renderer.getRenderTarget();

		this._render_target =
			this._render_target || this._create_render_target(texture.image.width, texture.image.height);

		renderer.setRenderTarget(this._render_target);
		renderer.clear();
		renderer.render(this._texture_scene, this._texture_camera);
		console.warn('rendered');
		renderer.setRenderTarget(prev_target);
		console.log(this._texture_material.fragmentShader);

		if (this._render_target.texture) {
			this.set_texture(this._render_target.texture);
		} else {
			this.cook_controller.end_cook();
		}
	}

	render_target() {
		return this._render_target;
	}

	private _create_render_target(width: number, height: number) {
		if (this._render_target) {
			const image = this._render_target.texture.image;
			if (image.width == width && image.height == height) {
				return this._render_target;
			}
		}

		const wrapS = ClampToEdgeWrapping;
		const wrapT = ClampToEdgeWrapping;

		const minFilter = LinearFilter;
		const magFilter = NearestFilter;

		var renderTarget = new WebGLRenderTarget(width, height, {
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
		null1.ui_data.set_position(0, -200);
		unreal_bloom1.ui_data.set_position(0, 200);
	}
}
