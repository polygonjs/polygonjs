import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {TypedMatNode} from './_Base';

import {TranslucentShader} from '../../../../modules/three/examples/jsm/shaders/TranslucentShader';
import {SideController, SideParamConfig} from './utils/SideController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';

function ParamOptionsFactoryColor(uniform_name: string) {
	return {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MeshTranslucentMatNode.PARAM_CALLBACK_update_uniformColor(
				node as MeshTranslucentMatNode,
				param,
				uniform_name
			);
		},
	};
}
function ParamOptionsFactoryTexture(uniform_name: string) {
	return {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MeshTranslucentMatNode.PARAM_CALLBACK_update_uniformTexture(
				node as MeshTranslucentMatNode,
				param,
				uniform_name
			);
		},
	};
}
function ParamOptionsFactoryN(uniform_name: string) {
	return {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MeshTranslucentMatNode.PARAM_CALLBACK_update_uniformN(node as MeshTranslucentMatNode, param, uniform_name);
		},
	};
}

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {IUniformN, IUniformTexture, IUniformColor} from '../utils/code/gl/Uniforms';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {FileCopNode} from '../cop/File';
import {NodeContext} from '../../poly/NodeContext';
import {BaseCopNodeType} from '../cop/_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {OperatorPathParam} from '../../params/OperatorPath';
class MeshTranslucentMatParamsConfig extends TextureMapParamConfig(
	TextureAlphaMapParamConfig(SkinningParamConfig(SideParamConfig(NodeParamsConfig)))
) {
	diffuse = ParamConfig.COLOR([1, 1, 1], {
		...ParamOptionsFactoryColor('diffuse'),
	});
	shininess = ParamConfig.FLOAT(1, {
		range: [0, 1000],
	});
	thickness_map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {
		node_selection: {context: NodeContext.COP},
		...ParamOptionsFactoryTexture('thicknessMap'),
	});
	thickness_color = ParamConfig.COLOR([0.5, 0.3, 0.0], {
		...ParamOptionsFactoryColor('thicknessColor'),
	});
	thickness_distortion = ParamConfig.FLOAT(0.1, {
		...ParamOptionsFactoryN('thicknessDistortion'),
	});
	thickness_ambient = ParamConfig.FLOAT(0.4, {
		...ParamOptionsFactoryN('thicknessAmbient'),
	});
	thickness_attenuation = ParamConfig.FLOAT(0.8, {
		...ParamOptionsFactoryN('thicknessAttenuation'),
	});
	thickness_power = ParamConfig.FLOAT(2.0, {
		range: [0, 10],
		...ParamOptionsFactoryN('thicknessPower'),
	});
	thickness_scale = ParamConfig.FLOAT(16.0, {
		range: [0, 100],
		...ParamOptionsFactoryN('thicknessScale'),
	});
}
const ParamsConfig = new MeshTranslucentMatParamsConfig();

interface ShaderMaterialWithUniforms extends ShaderMaterial {
	uniforms: {
		diffuse: IUniformColor;
		shininess: IUniformN;
		thicknessMap: IUniformTexture;
		thicknessColor: IUniformColor;
		thicknessDistortion: IUniformN;
		thicknessAmbient: IUniformN;
		thicknessAttenuation: IUniformN;
		thicknessPower: IUniformN;
		thicknessScale: IUniformN;
		[uniform: string]: IUniform;
	};
}

export class MeshTranslucentMatNode extends TypedMatNode<ShaderMaterialWithUniforms, MeshTranslucentMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_translucent';
	}
	create_material() {
		const uniforms = UniformsUtils.clone(TranslucentShader.uniforms);
		const material: ShaderMaterialWithUniforms = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: TranslucentShader.vertexShader,
			fragmentShader: TranslucentShader.fragmentShader,
			lights: true,
		}) as ShaderMaterialWithUniforms;
		material.extensions.derivatives = true;
		return material;
	}
	readonly texture_map_controller: TextureMapController = new TextureMapController(this, {
		uniforms: true,
		define: false,
		define_uv: false,
	});
	readonly texture_alpha_map_controller: TextureAlphaMapController = new TextureAlphaMapController(this, {
		uniforms: true,
		define: false,
		define_uv: false,
	});
	initialize_node() {
		this.params.set_post_create_params_hook(() => {
			this.texture_map_controller.initialize_node();
			this.texture_alpha_map_controller.initialize_node();
		});
	}
	async cook() {
		SideController.update(this);
		SkinningController.update(this);
		this.texture_map_controller.update();
		this.texture_alpha_map_controller.update();

		this.update_map(this.p.thickness_map, 'thicknessMap');
		this.material.uniforms.diffuse.value.copy(this.pv.diffuse);
		this.material.uniforms.shininess.value = this.pv.shininess;

		this.material.uniforms.thicknessColor.value.copy(this.pv.thickness_color);
		this.material.uniforms.thicknessDistortion.value = this.pv.thickness_distortion;
		this.material.uniforms.thicknessAmbient.value = this.pv.thickness_ambient;
		this.material.uniforms.thicknessAttenuation.value = this.pv.thickness_attenuation;
		this.material.uniforms.thicknessPower.value = this.pv.thickness_power;
		this.material.uniforms.thicknessScale.value = this.pv.thickness_scale;

		this.set_material(this.material);
	}

	// static PARAM_CALLBACK_update_thickness_map(node: MeshTranslucentMatNode) {
	// 	node.update_thickness_map();
	// }
	static PARAM_CALLBACK_update_uniformN(node: MeshTranslucentMatNode, param: BaseParamType, uniform_name: string) {
		node.material.uniforms[uniform_name].value = param.value;
	}
	static PARAM_CALLBACK_update_uniformColor(
		node: MeshTranslucentMatNode,
		param: BaseParamType,
		uniform_name: string
	) {
		if (param.parent_param) {
			node.material.uniforms[uniform_name].value.copy(param.parent_param.value);
		}
	}
	static PARAM_CALLBACK_update_uniformTexture(
		node: MeshTranslucentMatNode,
		param: BaseParamType,
		uniform_name: string
	) {
		node.update_map(param as OperatorPathParam, uniform_name);
	}
	async update_map(param: OperatorPathParam, uniform_name: string) {
		const node = param.found_node();
		if (node) {
			if (node.node_context() == NodeContext.COP) {
				const texture_node = node as BaseCopNodeType;
				const container = await texture_node.request_container();
				this.material.uniforms[uniform_name].value = container.texture();
				return;
			}
		}
		this.material.uniforms[uniform_name].value = null;
	}
}
