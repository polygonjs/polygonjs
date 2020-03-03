import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from '../../cop/File';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_map = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMapController));
		map = ParamConfig.OPERATOR_PATH(
			FileCopNode.DEFAULT_NODE_PATH.UV,
			OperatorPathOptions(TextureMapController, 'use_map')
		);
	};
}
class TextureMapMaterial extends Material {
	map!: Texture | null;
}
type CurrentMaterial = TextureMapMaterial | ShaderMaterial;
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}
abstract class TextureMapMatNode extends TypedMatNode<CurrentMaterial, TextureMapParamsConfig> {
	texture_map_controller!: TextureMapController;
	abstract create_material(): CurrentMaterial;
}

export class TextureMapController extends BaseTextureMapController {
	constructor(node: TextureMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initialize_node() {
		this.add_hooks(this.node.p.use_map, this.node.p.map);
	}
	async update() {
		this._update(this.node.material, 'map', this.node.p.use_map, this.node.p.map);
	}
	static async update(node: TextureMapMatNode) {
		node.texture_map_controller.update();
	}
}
