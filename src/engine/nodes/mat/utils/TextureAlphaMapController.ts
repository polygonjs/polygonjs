import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {NODE_PATH_DEFAULT} from '../../../../core/Walker';
export function TextureAlphaMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an alpha map */
		useAlphaMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureAlphaMapController));
		/** @param specify the alpha map COP node */
		alphaMap = ParamConfig.OPERATOR_PATH(
			NODE_PATH_DEFAULT.NODE.UV,
			OperatorPathOptions(TextureAlphaMapController, 'useAlphaMap')
		);
	};
}
class TextureAlphaMaterial extends Material {
	alphaMap!: Texture | null;
}
type CurrentMaterial = TextureAlphaMaterial | ShaderMaterial;
class TextureAlphaMapParamsConfig extends TextureAlphaMapParamConfig(NodeParamsConfig) {}
abstract class TextureAlphaMapMatNode extends TypedMatNode<CurrentMaterial, TextureAlphaMapParamsConfig> {
	texture_alpha_map_controller!: TextureAlphaMapController;
	abstract create_material(): CurrentMaterial;
}

export class TextureAlphaMapController extends BaseTextureMapController {
	constructor(protected node: TextureAlphaMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initialize_node() {
		this.add_hooks(this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	async update() {
		this._update(this.node.material, 'alphaMap', this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	static async update(node: TextureAlphaMapMatNode) {
		node.texture_alpha_map_controller.update();
	}
}
