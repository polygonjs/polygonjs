import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshStandardMaterial, MeshPhysicalMaterial, Material} from 'three';
import {DefaultOperationParams} from '../../../../core/operations/_Base';
import {TypedNodePathParamValue} from '../../../../core/Walker';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
// import {TypedSopNode} from '../../sop/_Base';

export interface EnvMapOperationParams extends DefaultOperationParams {
	useEnvMap: boolean;
	envMap: TypedNodePathParamValue;
	envMapIntensity: number;
}
export const ENV_MAP_OPERATION_DEFAULT_PARAMS: EnvMapOperationParams = {
	useEnvMap: false,
	envMap: new TypedNodePathParamValue(''),
	envMapIntensity: 1,
};
const DEFAULT_PARAMS = ENV_MAP_OPERATION_DEFAULT_PARAMS;

export function EnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an environment map */
		useEnvMap = ParamConfig.BOOLEAN(DEFAULT_PARAMS.useEnvMap, {
			separatorBefore: true,
			...BooleanParamOptions(TextureEnvMapController),
		});
		/** @param specify the environment map COP node */
		envMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureEnvMapController, 'useEnvMap'));
		/** @param environment intensity */
		envMapIntensity = ParamConfig.FLOAT(DEFAULT_PARAMS.envMapIntensity, {visibleIf: {useEnvMap: 1}});
	};
}

type TextureEnvMapControllerCurrentMaterial = MeshStandardMaterial | MeshPhysicalMaterial;
export function isValidEnvMapMaterial(material?: Material): material is TextureEnvMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (
		(material as MeshStandardMaterial).isMeshStandardMaterial ||
		(material as MeshPhysicalMaterial as any).isMeshPhysicalMaterial
	);
}
class TextureEnvMapParamsConfig extends EnvMapParamConfig(NodeParamsConfig) {}
export interface TextureEnvMapControllers {
	envMap: TextureEnvMapController;
}

// abstract class TextureEnvMapBaseSopNode extends TypedSopNode<TextureEnvMapParamsConfig> {}

abstract class TextureEnvMapMatNode extends TypedMatNode<
	TextureEnvMapControllerCurrentMaterial,
	TextureEnvMapParamsConfig
> {
	controllers!: TextureEnvMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureEnvMapControllerCurrentMaterial | undefined;
	}
}

// export class TextureEnvMapControllerSop extends BaseTextureMapController {
// 	constructor(protected override node: TextureEnvMapBaseSopNode) {
// 		super(node);
// 	}
// 	// initializeNode() {
// 	// 	this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
// 	// }
// 	async updateMaterial(material?: Material) {
// 		if (!_isValidMaterial(material)) {
// 			return;
// 		}
// 		this._update(material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
// 		const mat = material as MeshStandardMaterial;
// 		mat.envMapIntensity = this.node.pv.envMapIntensity;
// 		// mat.refractionRatio = this.node.pv.refractionRatio; // TODO: consider re-allowing this for Phong and Basic materials
// 	}
// }

export class TextureEnvMapController extends BaseTextureMapController {
	constructor(protected override node: TextureEnvMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
	}
	static override async update(node: TextureEnvMapMatNode) {
		node.controllers.envMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!isValidEnvMapMaterial(material)) {
			return;
		}
		this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureEnvMapControllerCurrentMaterial) {
		await this._update(material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
		material.envMapIntensity = this.node.pv.envMapIntensity;
		// mat.refractionRatio = this.node.pv.refractionRatio; // TODO: consider re-allowing this for Phong and Basic materials
	}
	override getTextures(material: TextureEnvMapControllerCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('envMap', material.envMap);
	}
	override setParamsFromMaterial(
		material: TextureEnvMapControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const mapNode = record.get('envMap');
		this.node.p.useEnvMap.set(mapNode != null);
		if (mapNode) {
			this.node.p.envMap.setNode(mapNode, {relative: true});
		}
		this.node.p.envMapIntensity.set(material.envMapIntensity);
	}
}
