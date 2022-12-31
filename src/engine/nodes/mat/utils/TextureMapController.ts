import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Material, MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshMatcapMaterial} from 'three';
import {MeshPhongMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {PointsMaterial} from 'three';
import {MeshToonMaterial} from 'three';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
export function MapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use a map affecting color */
		useMap = ParamConfig.BOOLEAN(0, {
			...BooleanParamOptions(TextureMapController),
			separatorBefore: true,
		});
		/** @param texture map affecting color */
		map = ParamConfig.NODE_PATH('', NodePathOptions(TextureMapController, 'useMap'));
	};
}

// class TextureMapMaterial extends Material {
// 	map!: Texture | null;
// }
type TextureMapCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshMatcapMaterial
	| MeshPhongMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial
	| PointsMaterial;
function _isValidMaterial(material?: Material): material is TextureMapCurrentMaterial {
	if (!material) {
		return false;
	}
	return true; //(material as MeshBasicMaterial).map != null;
}
class TextureMapParamsConfig extends MapParamConfig(NodeParamsConfig) {}
export interface TextureMapControllers {
	map: TextureMapController;
}
abstract class TextureMapMatNode extends TypedMatNode<TextureMapCurrentMaterial, TextureMapParamsConfig> {
	controllers!: TextureMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureMapCurrentMaterial | undefined;
	}
}

export class TextureMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useMap, this.node.p.map);
	}
	static override async update(node: TextureMapMatNode) {
		node.controllers.map.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			console.warn('invalid mat for TextureMapController', material);
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureMapCurrentMaterial) {
		await this._update(material, 'map', this.node.p.useMap, this.node.p.map);
	}
	override getTextures(material: TextureMapCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('map', material.map);
	}
	override setParamsFromMaterial(material: TextureMapCurrentMaterial, record: SetParamsTextureNodesRecord) {
		const mapNode = record.get('map');
		this.node.p.useMap.set(mapNode != null);
		if (mapNode) {
			this.node.p.map.setNode(mapNode, {relative: true});
		}
	}
}
