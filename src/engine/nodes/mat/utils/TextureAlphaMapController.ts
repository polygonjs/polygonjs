import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshPhongMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshMatcapMaterial} from 'three';
import {MeshToonMaterial} from 'three';
import {PointsMaterial} from 'three';
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
class TextureAlphaMapParamsConfig extends AlphaMapParamConfig(NodeParamsConfig) {}
interface TextureAlphaControllers {
	alphaMap: TextureAlphaMapController;
}
abstract class TextureAlphaMapMatNode extends TypedMatNode<
	TextureAlphaMapControllerCurrentMaterial,
	TextureAlphaMapParamsConfig
> {
	controllers!: TextureAlphaControllers;
	abstract override createMaterial(): TextureAlphaMapControllerCurrentMaterial;
}

export class TextureAlphaMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAlphaMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	override async update() {
		this._update(this.node.material, 'alphaMap', this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	static override async update(node: TextureAlphaMapMatNode) {
		node.controllers.alphaMap.update();
	}
}
