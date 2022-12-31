import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Material, MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshPhongMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshMatcapMaterial} from 'three';
import {MeshToonMaterial} from 'three';
import {PointsMaterial} from 'three';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
export function AlphaMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an alpha map */
		useAlphaMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureAlphaMapController),
		});
		/** @param specify the alpha map COP node */
		alphaMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureAlphaMapController, 'useAlphaMap'));
	};
}

type TextureAlphaMapControllerCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshPhongMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshMatcapMaterial
	| MeshToonMaterial
	| PointsMaterial;
function _isValidMaterial(material?: Material): material is TextureAlphaMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return true; //(material as MeshStandardMaterial).isM != null;
}
class TextureAlphaMapParamsConfig extends AlphaMapParamConfig(NodeParamsConfig) {}
export interface TextureAlphaMapControllers {
	alphaMap: TextureAlphaMapController;
}
abstract class TextureAlphaMapMatNode extends TypedMatNode<
	TextureAlphaMapControllerCurrentMaterial,
	TextureAlphaMapParamsConfig
> {
	controllers!: TextureAlphaMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureAlphaMapControllerCurrentMaterial | undefined;
	}
}

export class TextureAlphaMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAlphaMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	static override async update(node: TextureAlphaMapMatNode) {
		node.controllers.alphaMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureAlphaMapControllerCurrentMaterial) {
		await this._update(material, 'alphaMap', this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	override getTextures(material: TextureAlphaMapControllerCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('alphaMap', material.alphaMap);
	}
	override setParamsFromMaterial(
		material: TextureAlphaMapControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const mapNode = record.get('aoMap');
		this.node.p.useAlphaMap.set(mapNode != null);
		if (mapNode) {
			this.node.p.alphaMap.setNode(mapNode, {relative: true});
		}
	}
}
