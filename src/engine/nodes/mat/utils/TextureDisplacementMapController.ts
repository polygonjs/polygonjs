import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {
	Material,
	MeshMatcapMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
	MeshPhysicalMaterial,
	MeshNormalMaterial,
	MeshToonMaterial,
} from 'three';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
export function DisplacementMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a displacement map */
		useDisplacementMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureDisplacementMapController),
		});
		/** @param specify the displacement map COP node */
		displacementMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(TextureDisplacementMapController, 'useDisplacementMap')
		);
		/** @param displacement scale */
		displacementScale = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [false, false],
			...NodePathOptions(TextureDisplacementMapController, 'useDisplacementMap'),
		});
		/** @param displacement bias */
		displacementBias = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [false, false],
			...NodePathOptions(TextureDisplacementMapController, 'useDisplacementMap'),
		});
	};
}

type TextureDisplacementMapControllerCurrentMaterial =
	| MeshMatcapMaterial
	| MeshNormalMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial
	| MeshPhongMaterial;
function _isValidMaterial(material?: Material): material is TextureDisplacementMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshMatcapMaterial).displacementScale != null;
}
class TextureDisplacementMapParamsConfig extends DisplacementMapParamConfig(NodeParamsConfig) {}
export interface TextureDisplacementMapControllers {
	displacementMap: TextureDisplacementMapController;
}
abstract class TextureDisplacementMapMatNode extends TypedMatNode<
	TextureDisplacementMapControllerCurrentMaterial,
	TextureDisplacementMapParamsConfig
> {
	controllers!: TextureDisplacementMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureDisplacementMapControllerCurrentMaterial | undefined;
	}
}

export class TextureDisplacementMapController extends BaseTextureMapController {
	constructor(protected override node: TextureDisplacementMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useDisplacementMap, this.node.p.displacementMap);
	}
	static override async update(node: TextureDisplacementMapMatNode) {
		node.controllers.displacementMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureDisplacementMapControllerCurrentMaterial) {
		await this._update(material, 'displacementMap', this.node.p.useDisplacementMap, this.node.p.displacementMap);

		material.displacementScale = this.node.pv.displacementScale;
		material.displacementBias = this.node.pv.displacementBias;
	}
	override getTextures(material: TextureDisplacementMapControllerCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('displacementMap', material.displacementMap);
	}
	override setParamsFromMaterial(
		material: TextureDisplacementMapControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const mapNode = record.get('emissiveMap');
		this.node.p.useDisplacementMap.set(mapNode != null);
		if (mapNode) {
			this.node.p.displacementMap.setNode(mapNode, {relative: true});
		}
		this.node.p.displacementScale.set(material.displacementScale);
		this.node.p.displacementBias.set(material.displacementBias);
	}
}
