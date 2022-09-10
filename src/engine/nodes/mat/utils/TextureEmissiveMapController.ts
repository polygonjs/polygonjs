import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshPhongMaterial, MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshToonMaterial} from 'three';

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
class TextureEmissiveMapParamsConfig extends EmissiveMapParamConfig(NodeParamsConfig) {}
interface EmissiveControllers {
	emissiveMap: TextureEmissiveMapController;
}
abstract class TextureEmissiveMapMatNode extends TypedMatNode<
	TextureEmissiveMapControllerCurrentMaterial,
	TextureEmissiveMapParamsConfig
> {
	controllers!: EmissiveControllers;
	abstract override createMaterial(): TextureEmissiveMapControllerCurrentMaterial;
}

export class TextureEmissiveMapController extends BaseTextureMapController {
	constructor(protected override node: TextureEmissiveMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useEmissiveMap, this.node.p.emissiveMap);
	}
	override async update() {
		this._update(this.node.material, 'emissiveMap', this.node.p.useEmissiveMap, this.node.p.emissiveMap);

		const mat = this.node.material as TextureEmissiveMapControllerCurrentMaterial;
		mat.emissive.copy(this.node.pv.emissive);
		mat.emissiveIntensity = this.node.pv.emissiveIntensity;
	}
	static override async update(node: TextureEmissiveMapMatNode) {
		node.controllers.emissiveMap.update();
	}
}
