import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Material, MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshToonMaterial} from 'three';
export function AOMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an ambient occlusion map */
		useAOMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureAOMapController),
		});
		/** @param specify the AO map COP node */
		aoMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureAOMapController, 'useAOMap'));
		/** @param ambient occlusion intensity */
		aoMapIntensity = ParamConfig.FLOAT(1, {range: [0, 1], rangeLocked: [false, false], visibleIf: {useAOMap: 1}});
	};
}

type TextureAOMapControllerCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial;
function _isValidMaterial(material?: Material): material is TextureAOMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshBasicMaterial).aoMapIntensity != null;
}
class TextureAOMapParamsConfig extends AOMapParamConfig(NodeParamsConfig) {}
export interface TextureAOMapControllers {
	aoMap: TextureAOMapController;
}
abstract class TextureAOMapMatNode extends TypedMatNode<
	TextureAOMapControllerCurrentMaterial,
	TextureAOMapParamsConfig
> {
	controllers!: TextureAOMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureAOMapControllerCurrentMaterial | undefined;
	}
}

export class TextureAOMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAOMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useAOMap, this.node.p.aoMap);
	}
	static override async update(node: TextureAOMapMatNode) {
		node.controllers.aoMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureAOMapControllerCurrentMaterial) {
		await this._update(material, 'aoMap', this.node.p.useAOMap, this.node.p.aoMap);

		material.aoMapIntensity = this.node.pv.aoMapIntensity;
	}
}
