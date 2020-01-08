import {Vector2} from 'three/src/math/Vector2';
import {Camera} from 'three/src/cameras/Camera';
// import {CanvasTexture} from 'three/src/textures/CanvasTexture'

import {BasePostProcessNode} from './_Base';
// import {CoreScriptLoader} from 'src/core/loader/Script'
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCamera} from '../obj/_BaseCamera';
import {ShaderPass} from 'modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

import VertexShader from './Image/vert.glsl';
import FragmentShader from './Image/frag.glsl';

import {FileCopNode} from 'src/engine/nodes/cop/File';
// import {FuseActiveDesignPass} from 'src/Engine/Viewer/Fuse/FuseActiveDesignPass'

interface ShaderPassWithRequiredUniforms extends ShaderPass {
	uniforms: {
		map: IUniform;
	};
}

export class Image extends BasePostProcessNode {
	@ParamF('offset') _param_offset: number;
	@ParamF('darkness') _param_darkness: number;
	static type() {
		return 'image';
	}

	private _shader_class: any;
	private _pass: ShaderPassWithRequiredUniforms;

	// static async load_js(){
	// 	const {VignetteShader} = await CoreScriptLoader.load_module_three_shader('VignetteShader')
	// 	return VignetteShader;
	// }
	static _create_shader() {
		return {
			uniforms: {
				tDiffuse: {value: null} as IUniform,
				map: {value: null} as IUniform,
				offset: {value: 1.0},
				darkness: {value: 1.0},
			},
			vertexShader: VertexShader,
			fragmentShader: FragmentShader,
		};
	}

	constructor() {
		super();
	}

	create_params() {
		this.add_param(ParamType.OPERATOR_PATH, 'map', FileCopNode.DEFAULT_NODE_PATH.UV, {
			// texture: texture_options,
			// visible_if: visible_options,
			node_selection: {context: NodeContext.COP},
		});
		// this.add_param(ParamType.FLOAT, 'offset', 1, {range: [0, 1], range_locked: [false, false]})
		this.add_param(ParamType.FLOAT, 'mult', 1, {range: [0, 2], range_locked: [true, false]});
	}

	apply_to_composer(composer: EffectComposer, camera: Camera, resolution: Vector2, camera_node: BaseCamera) {
		// const pass = new ShaderPass(this._shader_class)
		// pass.uniforms["offset"].value = this._param_offset
		// pass.uniforms["darkness"].value = this._param_darkness
		if (this._pass) {
			composer.addPass(this._pass);
		}
	}

	async cook() {
		this._shader_class = this._shader_class || Image._create_shader();
		this._pass = this._pass || (new ShaderPass(this._shader_class) as ShaderPassWithRequiredUniforms);

		const map_node = this.params.get_operator_path('map').found_node();
		if (map_node) {
			const map_container = await map_node.request_container();
			const texture = map_container.core_content();
			if (texture) {
				this._pass.uniforms['map'].value = texture;
				console.log(this._pass.uniforms);
			}
		} else {
			this.states.error.set('map node not found');
		}

		this.cook_controller.end_cook();
	}
}
