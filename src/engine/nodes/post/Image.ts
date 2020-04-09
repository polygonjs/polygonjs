import {TypedPostProcessNode, TypedPostNodeContext, PostParamCallback} from './_Base';

import {ShaderPass} from '../../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';

import VertexShader from './Image/vert.glsl';
import FragmentShader from './Image/frag.glsl';

import {FileCopNode} from '../cop/File';
import {NodeContext} from '../../poly/NodeContext';

interface ShaderPassWithRequiredUniforms extends ShaderPass {
	uniforms: {
		map: IUniform;
		darkness: IUniform;
		offset: IUniform;
	};
}
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseCopNodeType} from '../cop/_Base';
class ImagePostParamsConfig extends NodeParamsConfig {
	map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {
		node_selection: {context: NodeContext.COP},
		callback: PostParamCallback,
	});
	darkness = ParamConfig.FLOAT(0, {
		range: [0, 2],
		range_locked: [true, false],
		callback: PostParamCallback,
	});
	offset = ParamConfig.FLOAT(0, {
		range: [0, 2],
		range_locked: [true, false],
		callback: PostParamCallback,
	});
}
const ParamsConfig = new ImagePostParamsConfig();
export class ImagePostNode extends TypedPostProcessNode<ShaderPass, ImagePostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'image';
	}

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

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(ImagePostNode._create_shader()) as ShaderPassWithRequiredUniforms;
		this.update_pass(pass);

		return pass;
	}
	update_pass(pass: ShaderPassWithRequiredUniforms) {
		pass.uniforms.darkness.value = this.pv.darkness;
		pass.uniforms.offset.value = this.pv.offset;

		this._update_map(pass);
	}
	private async _update_map(pass: ShaderPassWithRequiredUniforms) {
		if (this.p.map.is_dirty) {
			await this.p.map.compute();
		}
		const found_node = this.p.map.found_node();
		if (found_node) {
			if (found_node.node_context() == NodeContext.COP) {
				const cop_node = found_node as BaseCopNodeType;
				const map_container = await cop_node.request_container();
				const texture = map_container.core_content();
				pass.uniforms.map.value = texture;
			} else {
				this.states.error.set('node is not COP');
			}
		} else {
			this.states.error.set('no map found');
		}
	}
}
