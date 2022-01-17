/**
 * Adds an image effect.
 *
 *
 */
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {ShaderPass} from '../../../modules/three/examples/jsm/postprocessing/ShaderPass';
import {IUniformN, IUniformTexture} from '../utils/code/gl/Uniforms';
import VertexShader from './Image/vert.glsl';
import FragmentShader from './Image/frag.glsl';
import {NodeContext} from '../../poly/NodeContext';

interface ShaderPassWithRequiredUniforms extends ShaderPass {
	uniforms: {
		map: IUniformTexture;
		darkness: IUniformN;
		offset: IUniformN;
	};
}
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseCopNodeType} from '../cop/_Base';
class ImagePostParamsConfig extends NodeParamsConfig {
	/** @param map */
	map = ParamConfig.NODE_PATH('', {
		nodeSelection: {context: NodeContext.COP},
		...PostParamOptions,
	});
	/** @param darkness */
	darkness = ParamConfig.FLOAT(0, {
		range: [0, 2],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	/** @param offset */
	offset = ParamConfig.FLOAT(0, {
		range: [0, 2],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
}
const ParamsConfig = new ImagePostParamsConfig();
export class ImagePostNode extends TypedPostProcessNode<ShaderPass, ImagePostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'image';
	}

	static _create_shader() {
		return {
			uniforms: {
				tDiffuse: {value: null} as IUniformTexture,
				map: {value: null} as IUniformTexture,
				offset: {value: 1.0},
				darkness: {value: 1.0},
			},
			vertexShader: VertexShader,
			fragmentShader: FragmentShader,
		};
	}

	protected _createPass(context: TypedPostNodeContext) {
		const pass = new ShaderPass(ImagePostNode._create_shader()) as ShaderPassWithRequiredUniforms;
		this.updatePass(pass);

		return pass;
	}
	updatePass(pass: ShaderPassWithRequiredUniforms) {
		pass.uniforms.darkness.value = this.pv.darkness;
		pass.uniforms.offset.value = this.pv.offset;

		this._update_map(pass);
	}
	private async _update_map(pass: ShaderPassWithRequiredUniforms) {
		if (this.p.map.isDirty()) {
			await this.p.map.compute();
		}
		const foundNode = this.pv.map.nodeWithContext(NodeContext.COP, this.states.error);
		if (foundNode) {
			const cop_node = foundNode as BaseCopNodeType;
			const map_container = await cop_node.compute();
			const texture = map_container.coreContent();
			pass.uniforms.map.value = texture;
		} else {
			this.states.error.set('no map found');
		}
	}
}
