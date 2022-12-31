import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshStandardMaterial, MeshPhysicalMaterial, Material} from 'three';
import {DefaultOperationParams} from '../../../../core/operations/_Base';
import {TypedNodePathParamValue} from '../../../../core/Walker';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
// import {TypedSopNode} from '../../sop/_Base';

export interface MetalnessRoughnessOperationParams extends DefaultOperationParams {
	useMetalnessMap: boolean;
	metalnessMap: TypedNodePathParamValue;
	metalness: number;
	useRoughnessMap: boolean;
	roughnessMap: TypedNodePathParamValue;
	roughness: number;
}
export const METALNESS_ROUGHNESS_OPERATION_DEFAULT_PARAMS: MetalnessRoughnessOperationParams = {
	useMetalnessMap: false,
	metalnessMap: new TypedNodePathParamValue(''),
	metalness: 0,
	useRoughnessMap: false,
	roughnessMap: new TypedNodePathParamValue(''),
	roughness: 1,
};
const DEFAULT_PARAMS = METALNESS_ROUGHNESS_OPERATION_DEFAULT_PARAMS;

export function MetalnessRoughnessMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a metalness map */
		useMetalnessMap = ParamConfig.BOOLEAN(DEFAULT_PARAMS.useMetalnessMap, {
			separatorBefore: true,
			...BooleanParamOptions(TextureMetalnessRoughnessMapController),
		});
		/** @param specify the metalness map COP node */
		metalnessMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(TextureMetalnessRoughnessMapController, 'useMetalnessMap')
		);
		/** @param metalness. It's recommended to either set this value to 0 or to 1, as objects are either metallic or not. Any value in between tends to look like an alien plastic */
		metalness = ParamConfig.FLOAT(DEFAULT_PARAMS.metalness); // a default of 0 is good to non builder materials, but 1 should be better for builders, in case metalness is multiplied with this param from its child output node
		/** @param toggle if you want to use a roughness map */
		useRoughnessMap = ParamConfig.BOOLEAN(DEFAULT_PARAMS.useRoughnessMap, {
			separatorBefore: true,
			...BooleanParamOptions(TextureMetalnessRoughnessMapController),
		});
		/** @param specify the roughness map COP node */
		roughnessMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(TextureMetalnessRoughnessMapController, 'useRoughnessMap')
		);
		/** @param roughness. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		roughness = ParamConfig.FLOAT(DEFAULT_PARAMS.roughness);
	};
}

type TextureMetalnessRoughnessCurrentMaterial = MeshStandardMaterial | MeshPhysicalMaterial;
function _isValidMaterial(material?: Material): material is TextureMetalnessRoughnessCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshStandardMaterial).metalness != null;
}
class TextureMetalnessMapParamsConfig extends MetalnessRoughnessMapParamConfig(NodeParamsConfig) {}
export interface TextureMetalnessRoughnessMapControllers {
	metalnessRoughnessMap: TextureMetalnessRoughnessMapController;
}

// abstract class TextureMetalnessMapBaseSopNode extends TypedSopNode<TextureMetalnessMapParamsConfig> {}
abstract class TextureMetalnessMapMatNode extends TypedMatNode<
	TextureMetalnessRoughnessCurrentMaterial,
	TextureMetalnessMapParamsConfig
> {
	controllers!: TextureMetalnessRoughnessMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureMetalnessRoughnessCurrentMaterial | undefined;
	}
}

// export class TextureMetalnessRoughnessMapControllerSop extends BaseTextureMapController {
// 	constructor(protected override node: TextureMetalnessMapBaseSopNode) {
// 		super(node);
// 	}
// 	// initializeNode() {
// 	// 	this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
// 	// }
// 	async updateMaterial(material?: Material) {
// 		if (!_isValidMaterial(material)) {
// 			return;
// 		}
// 		this._update(material, 'metalnessMap', this.node.p.useMetalnessMap, this.node.p.metalnessMap);
// 		material.metalness = this.node.pv.metalness;

// 		this._update(material, 'roughnessMap', this.node.p.useRoughnessMap, this.node.p.roughnessMap);
// 		material.roughness = this.node.pv.roughness;
// 	}
// }
export class TextureMetalnessRoughnessMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMetalnessMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useMetalnessMap, this.node.p.metalnessMap);
	}
	static override async update(node: TextureMetalnessMapMatNode) {
		node.controllers.metalnessRoughnessMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureMetalnessRoughnessCurrentMaterial) {
		material.metalness = this.node.pv.metalness;
		material.roughness = this.node.pv.roughness;
		await Promise.all([
			this._update(material, 'metalnessMap', this.node.p.useMetalnessMap, this.node.p.metalnessMap),
			this._update(material, 'roughnessMap', this.node.p.useRoughnessMap, this.node.p.roughnessMap),
		]);
	}
	override getTextures(material: TextureMetalnessRoughnessCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('metalnessMap', material.metalnessMap);
		record.set('roughnessMap', material.roughnessMap);
	}
	override setParamsFromMaterial(
		material: TextureMetalnessRoughnessCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const metalnessMapNode = record.get('metalnessMap');
		const roughnessMapNode = record.get('roughnessMap');
		this.node.p.useMetalnessMap.set(metalnessMapNode != null);
		this.node.p.useRoughnessMap.set(roughnessMapNode != null);
		if (metalnessMapNode) {
			this.node.p.metalnessMap.setNode(metalnessMapNode, {relative: true});
		}
		if (roughnessMapNode) {
			this.node.p.roughnessMap.setNode(roughnessMapNode, {relative: true});
		}
		this.node.p.metalness.set(material.metalness);
		this.node.p.roughness.set(material.roughness);
	}
}
