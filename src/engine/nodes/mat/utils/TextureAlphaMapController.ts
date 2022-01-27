import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions, UpdateOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
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
class TextureAlphaMaterial extends Material {
	alphaMap!: Texture | null;
}
type CurrentMaterial = TextureAlphaMaterial | ShaderMaterial;
class TextureAlphaMapParamsConfig extends AlphaMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	alphaMap: TextureAlphaMapController;
}
abstract class TextureAlphaMapMatNode extends TypedMatNode<CurrentMaterial, TextureAlphaMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureAlphaMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAlphaMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
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
