import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {TypedPathParamValue} from '../../Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {BaseBuilderMatNodeType} from '../../../engine/nodes/mat/_BaseBuilder';
import {CoreMaterial} from '../../geometry/Material';
import {Object3D} from 'three/src/core/Object3D';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {Texture} from 'three/src/textures/Texture';
import {GlobalsGeometryHandler} from '../../../engine/nodes/gl/code/globals/Geometry';

interface MaterialSopParams extends DefaultOperationParams {
	group: string;
	material: TypedPathParamValue;
	apply_to_children: boolean;
	clone_mat: boolean;
	swap_current_tex: boolean;
	tex_src0: string;
	tex_dest0: string;
}

export class MaterialSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: MaterialSopParams = {
		group: '',
		material: new TypedPathParamValue('/MAT/mesh_standard1'),
		apply_to_children: true,
		clone_mat: false,
		swap_current_tex: false,
		tex_src0: 'emissiveMap',
		tex_dest0: 'map',
	};
	static type(): Readonly<'material'> {
		return 'material';
	}

	private _globals_handler: GlobalsGeometryHandler = new GlobalsGeometryHandler();

	async cook(input_contents: CoreGroup[], params: MaterialSopParams) {
		const core_group = input_contents[0];

		const material_node = params.material.ensure_node_context(NodeContext.MAT, this.states?.error);
		if (!material_node) {
			return core_group;
		}
		if (material_node) {
			const material = material_node.material;
			const assembler_controller = (material_node as BaseBuilderMatNodeType).assembler_controller;
			if (assembler_controller) {
				assembler_controller.set_assembler_globals_handler(this._globals_handler);
			}

			await material_node.request_container();
			if (material) {
				for (let object of core_group.objects_from_group(params.group)) {
					if (params.apply_to_children) {
						object.traverse((grand_child) => {
							this._apply_material(grand_child, material, params);
						});
					} else {
						this._apply_material(object, material, params);
					}
				}
				return core_group;
			} else {
				this.states?.error.set(`material invalid. (error: '${material_node.states.error.message}')`);
			}
		} else {
			this.states?.error.set(`no material node found`);
		}
		return core_group;
	}

	private _apply_material(object: Object3D, src_material: Material, params: MaterialSopParams) {
		const used_material = params.clone_mat ? CoreMaterial.clone(src_material) : src_material;

		const object_with_material = object as Mesh;
		const current_mat = object_with_material.material as Material | undefined;
		if (current_mat && params.swap_current_tex) {
			this._swap_textures(used_material, current_mat, params);
		}
		object_with_material.material = used_material;

		CoreMaterial.apply_render_hook(object, used_material);
		CoreMaterial.apply_custom_materials(object, used_material);
	}

	private _swap_textures(target_mat: Material, src_mat: Material, params: MaterialSopParams) {
		if (params.tex_src0 == '' || params.tex_dest0 == '') {
			return;
		}
		const src_tex: Texture | null = (src_mat as any)[params.tex_src0];
		if (src_tex) {
			(target_mat as any)[params.tex_dest0] = src_tex;
		}
	}
}
