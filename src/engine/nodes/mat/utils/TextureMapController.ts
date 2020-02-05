import {BaseController} from './_BaseController';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {TypedMatNode} from '../_Base';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_map = ParamConfig.BOOLEAN(0);
		map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {visible_if: {use_map: 1}});
	};
}
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}
class TextureMapMatNode extends TypedMatNode<MeshBasicMaterial, TextureMapParamsConfig> {
	create_material() {
		return new MeshBasicMaterial({});
	}
}

export class TextureMapController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }

	static async update(node: TextureMapMatNode) {
		const material = node.material;

		if (node.pv.use_map) {
			const texture_node = node.p.map.found_node();
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
