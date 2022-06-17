import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {Material} from 'three';
import {Texture} from 'three';
import {BaseMatNodeType} from '../_Base';
import {ParamConfig} from '../../utils/params/ParamsConfig';
import {NodeContext} from '../../../poly/NodeContext';
import {NodePathParam} from '../../../params/NodePath';
import {BooleanParam} from '../../../params/Boolean';
import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';

export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		useMap = ParamConfig.BOOLEAN(0);
		map = ParamConfig.NODE_PATH('', {visibleIf: {useMap: 1}});
	};
}

type FilterFlags<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
type SubType<Base, Condition> = Pick<Base, AllowedNames<Base, Condition>>;

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

type BaseTextureControllerCurrentMaterial = Material;

export class BaseTextureMapController extends BaseController {
	constructor(protected override node: BaseMatNodeType) {
		super(node);
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

	async _update<M extends BaseTextureControllerCurrentMaterial>(
		material: M,
		mat_attrib_name: string,
		use_map_param: BooleanParam,
		path_param: NodePathParam
	) {
		const mat = material as Material;
		const attr_name = mat_attrib_name as keyof SubType<Material, Texture | null>;
		await this._update_texture_on_material(mat, attr_name, use_map_param, path_param);
	}

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
}
