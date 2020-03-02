import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from '../../cop/File';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, OperatorPathOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
// import {NodeContext} from '../../../poly/NodeContext';
// import {BaseCopNodeType} from '../../cop/_Base';
export function TextureAlphaMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_alpha_map = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureAlphaMapController));
		alpha_map = ParamConfig.OPERATOR_PATH(
			FileCopNode.DEFAULT_NODE_PATH.UV,
			OperatorPathOptions(TextureAlphaMapController, 'use_alpha_map')
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
	constructor(protected node: TextureAlphaMapMatNode) {
		super(node);
	}
	initialize_node() {
		this.add_hooks(this.node.p.use_alpha_map, this.node.p.alpha_map);
	}
	async update() {
		this._update(this.node.material, 'alphaMap', this.node.p.use_alpha_map, this.node.p.alpha_map);
	}
	static async update(node: TextureAlphaMapMatNode) {
		node.texture_alpha_map_controller.update();
	}
}
