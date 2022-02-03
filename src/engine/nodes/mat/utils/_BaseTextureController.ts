import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {BaseMatNodeType} from '../_Base';
import {ParamConfig} from '../../utils/params/ParamsConfig';
import {NodeContext} from '../../../poly/NodeContext';
import {NodePathParam} from '../../../params/NodePath';
import {BooleanParam} from '../../../params/Boolean';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {
	IUniforms,
	MaterialWithCustomMaterials,
	ShaderMaterialWithCustomMaterials,
} from '../../../../core/geometry/Material';
import {CustomMaterialName} from '../../gl/code/assemblers/materials/_BaseMaterial';
import {Poly} from '../../../Poly';
import {isBooleanTrue} from '../../../../core/Type';

export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		useMap = ParamConfig.BOOLEAN(0);
		map = ParamConfig.NODE_PATH('', {visibleIf: {useMap: 1}});
	};
}
// class TextureMapMaterial<T extends string> extends Material {
// 	[T]!: Texture | null;
// }
// class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}
// class TextureMapMatNode extends TypedMatNode<TextureMapMaterial, TextureMapParamsConfig> {
// 	createMaterial() {
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
interface NodePathOptionsOptions {
	types?: string[];
}
export function NodePathOptions(
	controller: typeof BaseTextureMapController,
	use_map_name: string,
	options?: NodePathOptionsOptions
) {
	return {
		visibleIf: {[use_map_name]: 1},
		nodeSelection: {context: NodeContext.COP, types: options?.types},
		cook: false,
		callback: (node: BaseNodeType, param: BaseParamType) => {
			controller.update(node as BaseMatNodeType);
		},
	};
}

type TextureUpdateCallback<O extends Object> = (
	material: Material,
	object: O,
	mat_attrib_name: keyof SubType<O, Texture | null>,
	texture: Texture
) => void;
type TextureRemoveCallback<O extends Object> = (
	material: Material,
	object: O,
	mat_attrib_name: keyof SubType<O, Texture | null>
) => void;

type CurrentMaterial = Material | ShaderMaterial;

export interface UpdateOptions {
	directParams?: boolean;
	uniforms?: boolean;
	// define?: boolean;
	// define_uv?: boolean;
}
export class BaseTextureMapController extends BaseController {
	constructor(protected override node: BaseMatNodeType, protected _update_options: UpdateOptions) {
		super(node);
		// if (this._update_options.define == null) {
		// 	this._update_options.define = true;
		// }
		// if (this._update_options.define_uv == null) {
		// 	this._update_options.define_uv = true;
		// }
	}

	protected add_hooks(use_map_param: BooleanParam, path_param: NodePathParam) {
		use_map_param.addPostDirtyHook('TextureController', () => {
			this.update();
		});
		path_param.addPostDirtyHook('TextureController', () => {
			this.update();
		});
	}
	static update(node: BaseNodeType) {}

	async _update<M extends CurrentMaterial>(
		material: M,
		mat_attrib_name: string,
		use_map_param: BooleanParam,
		path_param: NodePathParam
	) {
		const {uniforms, directParams} = this._update_options;
		if (uniforms && isBooleanTrue(uniforms)) {
			const shader_material = material as ShaderMaterial;
			const attr_name = mat_attrib_name as keyof SubType<IUniforms, Texture | null>;
			await this._update_texture_on_uniforms(shader_material, attr_name, use_map_param, path_param);
		}
		if (directParams && isBooleanTrue(directParams)) {
			const mat = material as Material;
			const attr_name = mat_attrib_name as keyof SubType<Material, Texture | null>;
			await this._update_texture_on_material(mat, attr_name, use_map_param, path_param);
		}
	}

	//
	//
	// FOR CASES WHERE THE TEXTURE IS ON THE UNIFORMS
	//
	//
	async _update_texture_on_uniforms<O extends IUniform>(
		material: ShaderMaterial,
		mat_attrib_name: keyof SubType<O, Texture | null>,
		use_map_param: BooleanParam,
		path_param: NodePathParam
	) {
		this._update_required_attribute(
			material,
			material.uniforms,
			mat_attrib_name as never,
			use_map_param,
			path_param,
			this._apply_texture_on_uniforms.bind(this),
			this._remove_texture_from_uniforms.bind(this)
		);
	}
	private _apply_texture_on_uniforms<O extends IUniforms>(
		material: Material,
		uniforms: O,
		mat_attrib_name: keyof SubType<O, Texture | null>,
		texture: Texture
	) {
		if (!uniforms) {
			return;
		}
		const has_texture = uniforms[mat_attrib_name] != null && uniforms[mat_attrib_name].value != null;
		let new_texture_is_different = false;
		if (has_texture) {
			const current_texture: Texture = (<unknown>uniforms[mat_attrib_name].value) as Texture;
			if (current_texture.uuid != texture.uuid) {
				new_texture_is_different = true;
			}
		}
		if (!has_texture || new_texture_is_different) {
			const uniform = uniforms[mat_attrib_name];
			// check as the uniform may not exist on a customMaterial
			if (uniform) {
				uniforms[mat_attrib_name].value = texture as any;
			}
			// currently removing the settings of defines USE_MAP or USE_UV
			// as this seems to conflict with setting .map on the material itself.
			// ideally I should test if .alphaMap and .envMap still work
			// if (this._do_update_define()) {
			// 	if (material.defines) {
			// 		const define_name = this._define_name(`${mat_attrib_name}`);
			// 		material.defines[define_name] = 3;
			// 	}
			// }
			// if (this._update_options.define_uv) {
			// 	if (material.defines) {
			// 		material.defines['USE_UV'] = 5;
			// 	}
			// }
			this._apply_texture_on_material(material, material, mat_attrib_name as any, texture);
			material.needsUpdate = true;

			const customMaterials = (material as ShaderMaterialWithCustomMaterials).customMaterials;
			if (customMaterials) {
				const customNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
				for (let customName of customNames) {
					const customMaterial = customMaterials[customName] as ShaderMaterial;
					if (customMaterial) {
						this._apply_texture_on_uniforms(
							customMaterial,
							customMaterial.uniforms as O,
							mat_attrib_name,
							texture
						);
					}
				}
			}
		}
	}
	private _remove_texture_from_uniforms<U extends IUniforms>(
		material: Material,
		uniforms: U,
		mat_attrib_name: keyof SubType<U, Texture | null>
	) {
		if (!uniforms) {
			return;
		}
		if (!uniforms[mat_attrib_name]) {
			Poly.warn(`'${mat_attrib_name}' uniform not found. existing uniforms are:`, Object.keys(uniforms).sort());
			return;
		}
		if (uniforms[mat_attrib_name].value) {
			uniforms[mat_attrib_name].value = null;
			// if (this._do_update_define()) {
			// 	if (material.defines) {
			// 		// const define_name = this._define_name(`${mat_attrib_name}`);
			// 		// delete material.defines[define_name];
			// 	}
			// }
			this._remove_texture_from_material(material, material, mat_attrib_name as any);
			material.needsUpdate = true;

			const customMaterials = (material as MaterialWithCustomMaterials).customMaterials;
			if (customMaterials) {
				const customNames: CustomMaterialName[] = Object.keys(customMaterials) as CustomMaterialName[];
				for (let customName of customNames) {
					const customMaterial = customMaterials[customName] as ShaderMaterial;
					if (customMaterial) {
						this._remove_texture_from_uniforms(
							customMaterial,
							customMaterial.uniforms as U,
							mat_attrib_name
						);
					}
				}
			}
		}
	}
	// private _define_name(mat_attrib_name: string): string {
	// 	return 'USE_' + mat_attrib_name.replace('_', '').toUpperCase();
	// }

	//
	//
	// FOR CASES WHERE THE TEXTURE IS ON THE MATERIAL
	//
	//
	async _update_texture_on_material<M extends Material>(
		material: M,
		mat_attrib_name: keyof SubType<M, Texture | null>,
		use_map_param: BooleanParam,
		path_param: NodePathParam
	) {
		this._update_required_attribute(
			material,
			material,
			mat_attrib_name,
			use_map_param,
			path_param,
			this._apply_texture_on_material.bind(this),
			this._remove_texture_from_material.bind(this)
		);
	}
	private _apply_texture_on_material<M extends Material>(
		material: Material,
		texture_owner: M,
		mat_attrib_name: keyof SubType<M, Texture | null>,
		newTexture: Texture
	) {
		const currentTexture = (<unknown>texture_owner[mat_attrib_name]) as Texture | undefined;
		let textureChangeRequired = false;
		if (currentTexture) {
			if (currentTexture.uuid != newTexture.uuid) {
				textureChangeRequired = true;
			}
		}
		if (currentTexture == null || textureChangeRequired) {
			texture_owner[mat_attrib_name] = newTexture as any;
			material.needsUpdate = true;
		}
	}
	private _remove_texture_from_material<M extends Material>(
		material: Material,
		texture_owner: M,
		mat_attrib_name: keyof SubType<M, Texture | null>
	) {
		if (texture_owner[mat_attrib_name]) {
			texture_owner[mat_attrib_name] = null as any;
			material.needsUpdate = true;
		}
	}

	//
	//
	// MAIN ALGO to decide if texture should be updated
	//
	//
	private async _update_required_attribute<O extends Object>(
		material: Material,
		texture_owner: O,
		mat_attrib_name: keyof SubType<O, Texture | null>,
		use_map_param: BooleanParam,
		path_param: NodePathParam,
		update_callback: TextureUpdateCallback<O>,
		remove_callback: TextureRemoveCallback<O>
	) {
		if (use_map_param.isDirty()) {
			await use_map_param.compute();
		}
		const use_map: boolean = use_map_param.value;

		if (use_map) {
			if (path_param.isDirty()) {
				await path_param.compute();
			}

			const texture_node = path_param.value.nodeWithContext(NodeContext.COP);
			if (texture_node) {
				const container = await texture_node.compute();
				const texture = container.texture();

				if (texture) {
					update_callback(material, texture_owner, mat_attrib_name, texture);
					return;
				}
			}
		}
		// this is not wrapped in an else clause after the "if (use_map) {"
		// as we should come here after any of the errors above, if any is triggered
		remove_callback(material, texture_owner, mat_attrib_name);
	}

	// private _do_update_define(): boolean {
	// 	if (this._update_options.define == null) {
	// 		return true;
	// 	}
	// 	return this._update_options.define;
	// }
}
