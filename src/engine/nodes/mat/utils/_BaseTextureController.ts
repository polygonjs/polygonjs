import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {FileCopNode} from '../../cop/File';
import {BaseMatNodeType} from '../_Base';

import {ParamConfig} from '../../utils/params/ParamsConfig';
import {NodeContext} from '../../../poly/NodeContext';
import {BaseCopNodeType} from '../../cop/_Base';
import {OperatorPathParam} from '../../../params/OperatorPath';
import {BooleanParam} from '../../../params/Boolean';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
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

export function BooleanParamOptions(controller_class: typeof BaseTextureMapController) {
	return {
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			controller_class.update(node as BaseMatNodeType);
		},
	};
}
export function OperatorPathOptions(controller: typeof BaseTextureMapController, use_map_name: string) {
	return {
		visible_if: {[use_map_name]: 1},
		node_selection: {context: NodeContext.COP},
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			controller.update(node as BaseMatNodeType);
		},
	};
}

export class BaseTextureMapController extends BaseController {
	// add_params() {
	// 	this.node.add_param(ParamType.BOOLEAN, 'skinning', 0);
	// }
	protected add_hooks(use_map_param: BooleanParam, path_param: OperatorPathParam) {
		use_map_param.add_post_dirty_hook('TextureController', () => {
			this.update();
		});
		path_param.add_post_dirty_hook('TextureController', () => {
			this.update();
		});
	}
	static update(node: BaseNodeType) {}

	async _update_texture<M extends Material>(
		material: M,
		mat_attrib_name: keyof SubType<M, Texture | null>,
		use_map_param: BooleanParam,
		path_param: OperatorPathParam
	) {
		// if(!(mat_attrib_name in material)){
		// 	return
		// }
		if (use_map_param.is_dirty) {
			use_map_param.compute();
		}
		const use_map: boolean = use_map_param.value;

		if (use_map) {
			if (path_param.is_dirty) {
				await path_param.compute();
			}

			const found_node = path_param.found_node();
			if (found_node) {
				if (found_node.node_context() == NodeContext.COP) {
					const texture_node = found_node as BaseCopNodeType;

					// if the texture has already been created, we don't have to wait for request_container
					// if (texture_node.texture) {
					// 	console.log('no wait');
					// 	texture_node.request_container();
					// } else {
					// 	console.log('wait');
					const container = await texture_node.request_container();
					const texture = container.texture();
					// }

					if (texture) {
						const has_no_texture = material[mat_attrib_name] == null;
						let texture_is_different = false;
						if (material[mat_attrib_name]) {
							const current_texture: Texture = (<unknown>material[mat_attrib_name]) as Texture;
							if (current_texture.uuid != texture.uuid) {
								texture_is_different = true;
							}
						}
						if (has_no_texture || texture_is_different) {
							material[mat_attrib_name] = texture as any;
							material.needsUpdate = true;
						}
						return;
					} else {
						this.node.states.error.set(`found node has no texture`);
					}
				} else {
					this.node.states.error.set(`found map node is not a COP node`);
				}
			} else {
				this.node.states.error.set(`could not find map node ${path_param.name} with path ${path_param.value}`);
			}
		}
		if (material[mat_attrib_name]) {
			material[mat_attrib_name] = null as any;
			material.needsUpdate = true;
		}
	}
}
