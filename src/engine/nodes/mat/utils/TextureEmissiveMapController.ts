import {Constructor, Number3} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Material, MeshPhongMaterial, MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshToonMaterial} from 'three';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';

export function EmissiveMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param emissive color */
		emissive = ParamConfig.COLOR([0, 0, 0], {separatorBefore: true});
		/** @param toggle if you want to use a emissive map */
		useEmissiveMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureEmissiveMapController));
		/** @param specify the emissive map COP node */
		emissiveMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureEmissiveMapController, 'useEmissiveMap'));
		/** @param emissive intensity */
		emissiveIntensity = ParamConfig.FLOAT(1);
	};
}

type TextureEmissiveMapControllerCurrentMaterial =
	| MeshPhongMaterial
	| MeshLambertMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial;
function _isValidMaterial(material?: Material): material is TextureEmissiveMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshStandardMaterial).emissive != null;
}
class TextureEmissiveMapParamsConfig extends EmissiveMapParamConfig(NodeParamsConfig) {}
export interface TextureEmissiveMapControllers {
	emissiveMap: TextureEmissiveMapController;
}
abstract class TextureEmissiveMapMatNode extends TypedMatNode<
	TextureEmissiveMapControllerCurrentMaterial,
	TextureEmissiveMapParamsConfig
> {
	controllers!: TextureEmissiveMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureEmissiveMapControllerCurrentMaterial | undefined;
	}
}
const tmpN3: Number3 = [0, 0, 0];
export class TextureEmissiveMapController extends BaseTextureMapController {
	constructor(protected override node: TextureEmissiveMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useEmissiveMap, this.node.p.emissiveMap);
	}
	static override async update(node: TextureEmissiveMapMatNode) {
		node.controllers.emissiveMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureEmissiveMapControllerCurrentMaterial) {
		await this._update(material, 'emissiveMap', this.node.p.useEmissiveMap, this.node.p.emissiveMap);

		material.emissive.copy(this.node.pv.emissive);
		material.emissiveIntensity = this.node.pv.emissiveIntensity;
	}
	override getTextures(material: TextureEmissiveMapControllerCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('emissiveMap', material.emissiveMap);
	}
	override setParamsFromMaterial(
		material: TextureEmissiveMapControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const mapNode = record.get('emissiveMap');
		this.node.p.useEmissiveMap.set(mapNode != null);
		if (mapNode) {
			this.node.p.emissiveMap.setNode(mapNode, {relative: true});
		}
		material.emissive.toArray(tmpN3);
		this.node.p.emissive.set(tmpN3);
		this.node.p.emissiveIntensity.set(material.emissiveIntensity);
	}
}
