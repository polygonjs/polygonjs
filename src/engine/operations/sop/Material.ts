import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {TypedNodePathParamValue} from '../../../core/Walker';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {BaseBuilderMatNodeType} from '../../../engine/nodes/mat/_BaseBuilder';
import {CoreMaterial} from '../../../core/geometry/Material';
import {Object3D} from 'three/src/core/Object3D';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
import {Texture} from 'three/src/textures/Texture';
import {GlobalsGeometryHandler} from '../../../engine/nodes/gl/code/globals/Geometry';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {CoreObject} from '../../../core/geometry/Object';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface MaterialSopParams extends DefaultOperationParams {
	group: string;
	assignMat: boolean;
	material: TypedNodePathParamValue;
	applyToChildren: boolean;
	cloneMat: boolean;
	shareUniforms: boolean;
	swapCurrentTex: boolean;
	texSrc0: string;
	texDest0: string;
}

export class MaterialSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: MaterialSopParams = {
		group: '',
		assignMat: true,
		material: new TypedNodePathParamValue('/MAT/mesh_standard1'),
		applyToChildren: true,
		cloneMat: false,
		shareUniforms: true,
		swapCurrentTex: false,
		texSrc0: 'emissiveMap',
		texDest0: 'map',
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'material'> {
		return 'material';
	}

	private _globals_handler: GlobalsGeometryHandler = new GlobalsGeometryHandler();

	async cook(input_contents: CoreGroup[], params: MaterialSopParams) {
		const core_group = input_contents[0];

		this._old_mat_by_old_new_id.clear();

		await this._apply_materials(core_group, params);
		this._swap_textures(core_group, params);
		return core_group;
	}

	private async _apply_materials(core_group: CoreGroup, params: MaterialSopParams) {
		if (!isBooleanTrue(params.assignMat)) {
			return;
		}

		const material_node = params.material.nodeWithContext(NodeContext.MAT, this.states?.error);
		if (material_node) {
			const material = material_node.material;
			const assembler_controller = (material_node as BaseBuilderMatNodeType).assemblerController;
			if (assembler_controller) {
				assembler_controller.set_assembler_globals_handler(this._globals_handler);
			}

			await material_node.requestContainer();
			if (material) {
				if (isBooleanTrue(params.applyToChildren)) {
					// if we apply to children, the group will be tested inside _apply_material
					for (let object of core_group.objects()) {
						object.traverse((grand_child) => {
							this._apply_material(grand_child, material, params);
						});
					}
				} else {
					// if we apply to children, the group is tested here
					for (let object of core_group.objectsFromGroup(params.group)) {
						this._apply_material(object, material, params);
					}
				}

				return core_group;
			} else {
				this.states?.error.set(`material invalid. (error: '${material_node.states.error.message()}')`);
			}
		} else {
			this.states?.error.set(`no material node found`);
		}
	}

	private _old_mat_by_old_new_id: Map<string, Material> = new Map();
	private _materials_by_uuid: Map<string, Material> = new Map();
	private _swap_textures(core_group: CoreGroup, params: MaterialSopParams) {
		if (!isBooleanTrue(params.swapCurrentTex)) {
			return;
		}

		this._materials_by_uuid.clear();

		for (let object of core_group.objectsFromGroup(params.group)) {
			if (params.applyToChildren) {
				object.traverse((child) => {
					const mat = (object as Mesh).material as Material;
					this._materials_by_uuid.set(mat.uuid, mat);
				});
			} else {
				const mat = (object as Mesh).material as Material;
				this._materials_by_uuid.set(mat.uuid, mat);
			}
		}

		this._materials_by_uuid.forEach((mat, mat_uuid) => {
			this._swap_texture(mat, params);
		});
	}

	private _apply_material(object: Object3D, src_material: Material, params: MaterialSopParams) {
		if (params.group) {
			if (!CoreObject.isInGroup(params.group, object)) {
				return;
			}
		}

		const used_material = isBooleanTrue(params.cloneMat) ? CoreMaterial.clone(src_material) : src_material;

		if (src_material instanceof ShaderMaterial && used_material instanceof ShaderMaterial) {
			for (let uniform_name in src_material.uniforms) {
				used_material.uniforms[uniform_name] = src_material.uniforms[uniform_name];
			}
		}

		const object_with_material = object as Mesh;
		// const current_mat = object_with_material.material as Material | undefined;
		// if (current_mat && params.swapCurrentTex) {
		// 	this._swap_texture(used_material, current_mat, params);
		// }
		this._old_mat_by_old_new_id.set(used_material.uuid, object_with_material.material as Material);
		object_with_material.material = used_material;

		CoreMaterial.apply_render_hook(object, used_material);
		CoreMaterial.applyCustomMaterials(object, used_material);
	}

	private _swap_texture(target_mat: Material, params: MaterialSopParams) {
		if (params.texSrc0 == '' || params.texDest0 == '') {
			return;
		}
		let src_mat = this._old_mat_by_old_new_id.get(target_mat.uuid);
		src_mat = src_mat || target_mat;

		const src_tex: Texture | null = (src_mat as any)[params.texSrc0];
		if (src_tex) {
			// swap mat param
			(target_mat as any)[params.texDest0] = src_tex;
			// (src_mat as any)[params.texSrc0] = null;
			// swap uniforms
			const uniforms = (target_mat as any).uniforms;
			if (uniforms) {
				const uniforms_map = uniforms[params.texDest0];
				if (uniforms_map) {
					uniforms[params.texDest0] = {value: src_tex};
					// uniforms[params.texSrc0] = {value: null};
				}
			}
		}
	}
}
