import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
export function TextureAlphaMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_alpha_map = ParamConfig.BOOLEAN(0);
		alpha_map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {visible_if: {use_alpha_map: 1}});
	};
}
class TextureAlphaMaterial extends Material {
	map!: Texture | null;
}
class TextureAlphaMapParamsConfig extends TextureAlphaMapParamConfig(NodeParamsConfig) {}
class TextureAlphaMapMatNode extends TypedMatNode<TextureAlphaMaterial, TextureAlphaMapParamsConfig> {
	create_material() {
		return new TextureAlphaMaterial();
	}
}

export class TextureAlphaMapController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }

	static async update(node: TextureAlphaMapMatNode) {
		const material = node.material;

		if (node.pv.use_alpha_map) {
			const texture_node = node.p.alpha_map.found_node();
			if (texture_node) {
				const container = await texture_node?.request_container();
				material.map = container.texture;
			} else {
				material.map = null;
				node.states.error.set(`could not find map`);
			}
		} else {
			material.map = null;
		}
	}
}
