import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {BaseMatNodeType} from '../_Base';

import {ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {BaseCopNodeType} from '../../cop/_Base';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		use_map = ParamConfig.BOOLEAN(0);
		map = ParamConfig.OPERATOR_PATH(FileCopNode.DEFAULT_NODE_PATH.UV, {visible_if: {use_map: 1}});
	};
}
// class TextureMapMaterial<T extends string> extends Material {
// 	[T]!: Texture | null;
// }
// class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}
// class TextureMapMatNode extends TypedMatNode<TextureMapMaterial, TextureMapParamsConfig> {
// 	create_material() {
// 		return new TextureMapMaterial();
// 	}
// }

type FilterFlags<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

// type test = FilterFlags<MeshLambertMaterial, Texture|null>
// type test2 = AllowedNames<MeshLambertMaterial, Texture|null>
// type test3 = SubType<MeshLambertMaterial, Texture|null>

export class BaseTextureMapController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }

	static async _update<M extends Material>(
		node: BaseMatNodeType,
		material: M,
		mat_attrib_name: keyof SubType<M, Texture | null>,
		use_map: boolean,
		path_param: OperatorPathParam
	) {
		// if(!(mat_attrib_name in material)){
		// 	return
		// }

		if (use_map) {
			const found_node = path_param.found_node();
			if (found_node) {
				if (found_node.node_context() == NodeContext.COP) {
					const texture_node = found_node as BaseCopNodeType;

					// if the texture has already been created, we don't have to wait for request_container
					if (texture_node.texture) {
						texture_node.request_container();
					} else {
						await texture_node.request_container();
					}

					if (texture_node.texture) {
						const has_no_texture = material[mat_attrib_name] == null;
						let texture_is_different = false;
						if (material[mat_attrib_name]) {
							const current_texture: Texture = (<unknown>material[mat_attrib_name]) as Texture;
							if (current_texture.uuid != texture_node.texture.uuid) {
								texture_is_different = true;
							}
						}
						if (has_no_texture || texture_is_different) {
							material[mat_attrib_name] = texture_node.texture as any;
							material.needsUpdate = true;
						}
						return;
					} else {
						node.states.error.set(`found node has no texture`);
					}
				} else {
					node.states.error.set(`found map node is not a COP node`);
				}
			} else {
				node.states.error.set(`could not find map node`);
			}
		}
		if (material[mat_attrib_name]) {
			material[mat_attrib_name] = null as any;
			material.needsUpdate = true;
		}
	}
}
