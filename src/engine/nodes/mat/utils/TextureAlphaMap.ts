// import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
// import {NodeContext} from 'src/engine/poly/NodeContext';
// import {BaseCopNodeType} from '../../cop/_Base';
import {BaseTextureMapController} from './_BaseTextureController';
export function TextureAlphaMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_alpha_map = ParamConfig.BOOLEAN(0);
		alpha_map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {visible_if: {use_alpha_map: 1}});
	};
}
class TextureAlphaMaterial extends Material {
	alphaMap!: Texture | null;
}
class TextureAlphaMapParamsConfig extends TextureAlphaMapParamConfig(NodeParamsConfig) {}
class TextureAlphaMapMatNode extends TypedMatNode<TextureAlphaMaterial, TextureAlphaMapParamsConfig> {
	create_material() {
		return new TextureAlphaMaterial();
	}
}

export class TextureAlphaMapController extends BaseTextureMapController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }

	static async update(node: TextureAlphaMapMatNode) {
		this._update(node, node.material, 'alphaMap', node.pv.use_alpha_map, node.p.alpha_map);
	}

	// static async update(node: TextureAlphaMapMatNode) {
	// 	const material = node.material;

	// 	if (node.pv.use_map) {
	// 		const found_node = node.p.alpha_map.found_node();
	// 		if (found_node) {
	// 			if (found_node.node_context() == NodeContext.COP) {
	// 				const texture_node = found_node as BaseCopNodeType;

	// 				// if the texture has already been created, we don't have to wait for request_container
	// 				if (texture_node.texture) {
	// 					texture_node.request_container();
	// 				} else {
	// 					await texture_node.request_container();
	// 				}

	// 				if (texture_node.texture) {
	// 					material.alphaMap = texture_node.texture;
	// 					return;
	// 				}
	// 			} else {
	// 				node.states.error.set(`found map node is not a COP node`);
	// 			}
	// 		} else {
	// 			node.states.error.set(`could not find map node`);
	// 		}
	// 	}
	// 	material.alphaMap = null;
	// }
}
