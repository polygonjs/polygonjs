import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {Material} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshMatcapMaterial} from 'three';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';

export function MatcapMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a matcap map */
		useMatcapMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMatcapMapController));
		/** @param specify the matcap map COP node */
		matcapMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureMatcapMapController, 'useMatcapMap'));
	};
}

type TextureMatcapMaterial = MeshMatcapMaterial;
function _isValidMaterial(material?: Material): material is TextureMatcapMaterial {
	if (!material) {
		return false;
	}
	return true; //(material as MeshMatcapMaterial).matcap != null;
}
type TextureMatCapControllerCurrentMaterial = TextureMatcapMaterial; //| ShaderMaterial;
class TextureMatcapMapParamsConfig extends MatcapMapParamConfig(NodeParamsConfig) {}
export interface TextureMatcapMapControllers {
	matcap: TextureMatcapMapController;
}
abstract class TextureMatcapMapMatNode extends TypedMatNode<
	TextureMatCapControllerCurrentMaterial,
	TextureMatcapMapParamsConfig
> {
	controllers!: TextureMatcapMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureMatCapControllerCurrentMaterial | undefined;
	}
}

export class TextureMatcapMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMatcapMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	static override async update(node: TextureMatcapMapMatNode) {
		node.controllers.matcap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureMatCapControllerCurrentMaterial) {
		await this._update(material, 'matcap', this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	override getTextures(material: TextureMatCapControllerCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('matcap', material.matcap);
	}
	override setParamsFromMaterial(
		material: TextureMatCapControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const mapNode = record.get('matcap');
		this.node.p.useMatcapMap.set(mapNode != null);
		if (mapNode) {
			this.node.p.matcapMap.setNode(mapNode, {relative: true});
		}
	}
}
