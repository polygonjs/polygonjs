import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Material, MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshToonMaterial} from 'three';

export function LightMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a light map */
		useLightMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureLightMapController),
		});
		/** @param specify the light map COP node */
		lightMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureLightMapController, 'useLightMap'));
		/** @param light. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		lightMapIntensity = ParamConfig.FLOAT(1, {
			visibleIf: {useLightMap: 1},
		});
	};
}

type TextureLightMapCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial;
function _isValidMaterial(material?: Material): material is TextureLightMapCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshBasicMaterial).lightMapIntensity != null;
}
class TextureLightMapParamsConfig extends LightMapParamConfig(NodeParamsConfig) {}
export interface TextureLightMapControllers {
	lightMap: TextureLightMapController;
}
abstract class TextureLightMapMatNode extends TypedMatNode<
	TextureLightMapCurrentMaterial,
	TextureLightMapParamsConfig
> {
	controllers!: TextureLightMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureLightMapCurrentMaterial | undefined;
	}
}

export class TextureLightMapController extends BaseTextureMapController {
	constructor(protected override node: TextureLightMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useLightMap, this.node.p.lightMap);
	}
	static override async update(node: TextureLightMapMatNode) {
		node.controllers.lightMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}

		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureLightMapCurrentMaterial) {
		await this._update(material, 'lightMap', this.node.p.useLightMap, this.node.p.lightMap);
		material.lightMapIntensity = this.node.pv.lightMapIntensity;
	}
}
