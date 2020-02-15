// import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
// import {NodeContext} from 'src/engine/poly/NodeContext';
// import {BaseCopNodeType} from '../../cop/_Base';
import {BaseTextureMapController} from './_BaseTextureController';
export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_map = ParamConfig.BOOLEAN(0);
		map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {visible_if: {use_map: 1}});
	};
}
class TextureMapMaterial extends Material {
	map!: Texture | null;
}
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}
class TextureMapMatNode extends TypedMatNode<TextureMapMaterial, TextureMapParamsConfig> {
	create_material() {
		return new TextureMapMaterial();
	}
}

export class TextureMapController extends BaseTextureMapController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }

	static async update(node: TextureMapMatNode) {
		this._update(node, node.material, 'map', node.pv.use_map, node.p.map);
	}

	// static async update(node: TextureMapMatNode) {
	// 	const material = node.material;

	// 	if (node.pv.use_map) {
	// 		const found_node = node.p.map.found_node();
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
	// 					if (!material.map || material.map.uuid != texture_node.texture.uuid) {
	// 						material.map = texture_node.texture;
	// 						material.needsUpdate = true;
	// 					}
	// 					return;
	// 				}
	// 			} else {
	// 				node.states.error.set(`found map node is not a COP node`);
	// 			}
	// 		} else {
	// 			node.states.error.set(`could not find map node`);
	// 		}
	// 	}
	// 	if (material.map) {
	// 		material.map = null;
	// 		material.needsUpdate = true;
	// 	}
	// }
}
