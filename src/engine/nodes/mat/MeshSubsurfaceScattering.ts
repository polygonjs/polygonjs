/**
 * Creates a Mesh Subsurface Scattering Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {TypedMatNode} from './_Base';
import {SubsurfaceScatteringShader} from '../../../modules/three/examples/jsm/shaders/SubsurfaceScatteringShader';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {IUniformN, IUniformTexture, IUniformColor} from '../utils/code/gl/Uniforms';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {NodeContext} from '../../poly/NodeContext';
import {BaseCopNodeType} from '../cop/_Base';
import {WireframeController, WireframeParamConfig} from './utils/WireframeShaderMaterialController';
import {FogController, FogParamConfig} from './utils/FogController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodePathParam} from '../../params/NodePath';
import {NODE_PATH_DEFAULT} from '../../../core/Walker';
import {Constructor} from '../../../types/GlobalTypes';

function ParamOptionsFactoryColor(uniform_name: string) {
	return {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MeshSubsurfaceScatteringMatNode.PARAM_CALLBACK_update_uniformColor(
				node as MeshSubsurfaceScatteringMatNode,
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
			MeshSubsurfaceScatteringMatNode.PARAM_CALLBACK_update_uniformTexture(
				node as MeshSubsurfaceScatteringMatNode,
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
			MeshSubsurfaceScatteringMatNode.PARAM_CALLBACK_update_uniformN(
				node as MeshSubsurfaceScatteringMatNode,
				param,
				uniform_name
			);
		},
	};
}

const CONTROLLER_OPTIONS = {
	uniforms: true,
};
interface Controllers {
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	map: TextureMapController;
}

export function SubsurfaceParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		diffuse = ParamConfig.COLOR([1, 1, 1], {
			...ParamOptionsFactoryColor('diffuse'),
		});
		shininess = ParamConfig.FLOAT(1, {
			range: [0, 1000],
		});
		thicknessMap = ParamConfig.NODE_PATH(NODE_PATH_DEFAULT.NODE.EMPTY, {
			nodeSelection: {context: NodeContext.COP},
			...ParamOptionsFactoryTexture('thicknessMap'),
		});
		thicknessColor = ParamConfig.COLOR([0.5, 0.3, 0.0], {
			...ParamOptionsFactoryColor('thicknessColor'),
		});
		thicknessDistortion = ParamConfig.FLOAT(0.1, {
			...ParamOptionsFactoryN('thicknessDistortion'),
		});
		thicknessAmbient = ParamConfig.FLOAT(0.4, {
			...ParamOptionsFactoryN('thicknessAmbient'),
		});
		thicknessAttenuation = ParamConfig.FLOAT(0.8, {
			...ParamOptionsFactoryN('thicknessAttenuation'),
		});
		thicknessPower = ParamConfig.FLOAT(2.0, {
			range: [0, 10],
			...ParamOptionsFactoryN('thicknessPower'),
		});
		thicknessScale = ParamConfig.FLOAT(16.0, {
			range: [0, 100],
			...ParamOptionsFactoryN('thicknessScale'),
		});
	};
}
class MeshSubsurfaceScatteringMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			AdvancedCommonParamConfig(
				/* advanced */
				AdvancedFolderParamConfig(
					AlphaMapParamConfig(
						MapParamConfig(
							/* textures */
							TexturesFolderParamConfig(SubsurfaceParamConfig(DefaultFolderParamConfig(NodeParamsConfig)))
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new MeshSubsurfaceScatteringMatParamsConfig();

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

export class MeshSubsurfaceScatteringMatNode extends TypedMatNode<
	ShaderMaterialWithUniforms,
	MeshSubsurfaceScatteringMatParamsConfig
> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'meshSubsurfaceScattering';
	}
	createMaterial() {
		const uniforms = UniformsUtils.clone(SubsurfaceScatteringShader.uniforms);
		const material: ShaderMaterialWithUniforms = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: SubsurfaceScatteringShader.vertexShader,
			fragmentShader: SubsurfaceScatteringShader.fragmentShader,
			lights: true,
		}) as ShaderMaterialWithUniforms;
		material.extensions.derivatives = true;
		return material;
	}
	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;

	initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		FogController.update(this);
		SkinningController.update(this);
		WireframeController.update(this);

		this.update_map(this.p.thicknessMap, 'thicknessMap');
		this.material.uniforms.diffuse.value.copy(this.pv.diffuse);
		this.material.uniforms.shininess.value = this.pv.shininess;

		this.material.uniforms.thicknessColor.value.copy(this.pv.thicknessColor);
		this.material.uniforms.thicknessDistortion.value = this.pv.thicknessDistortion;
		this.material.uniforms.thicknessAmbient.value = this.pv.thicknessAmbient;
		this.material.uniforms.thicknessAttenuation.value = this.pv.thicknessAttenuation;
		this.material.uniforms.thicknessPower.value = this.pv.thicknessPower;
		this.material.uniforms.thicknessScale.value = this.pv.thicknessScale;

		this.setMaterial(this.material);
	}

	// static PARAM_CALLBACK_update_thickness_map(node: MeshTranslucentMatNode) {
	// 	node.update_thickness_map();
	// }
	static PARAM_CALLBACK_update_uniformN(
		node: MeshSubsurfaceScatteringMatNode,
		param: BaseParamType,
		uniform_name: string
	) {
		node.material.uniforms[uniform_name].value = param.value;
	}
	static PARAM_CALLBACK_update_uniformColor(
		node: MeshSubsurfaceScatteringMatNode,
		param: BaseParamType,
		uniform_name: string
	) {
		if (param.parent_param) {
			node.material.uniforms[uniform_name].value.copy(param.parent_param.value);
		}
	}
	static PARAM_CALLBACK_update_uniformTexture(
		node: MeshSubsurfaceScatteringMatNode,
		param: BaseParamType,
		uniform_name: string
	) {
		node.update_map(param as NodePathParam, uniform_name);
	}
	async update_map(param: NodePathParam, uniform_name: string) {
		const node = param.value.nodeWithContext(NodeContext.COP);
		if (!node) {
			this.material.uniforms[uniform_name].value = null;
		}
		const texture_node = node as BaseCopNodeType;
		const container = await texture_node.requestContainer();
		this.material.uniforms[uniform_name].value = container.texture();
	}
}
