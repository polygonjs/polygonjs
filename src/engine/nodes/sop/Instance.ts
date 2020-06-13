import {TypedSopNode} from './_Base';

import {CoreGroup} from '../../../core/geometry/Group';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {CoreMaterial} from '../../../core/geometry/Material';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {GlobalsGeometryHandler} from '../gl/code/globals/Geometry';
import {NodeContext} from '../../poly/NodeContext';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BaseBuilderMatNodeType} from '../mat/_BaseBuilder';
import {BaseMatNodeType} from '../mat/_Base';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MaterialsObjNode} from '../obj/Materials';
import {ObjectTypeByObject} from '../../../core/geometry/Constant';
class InstanceSopParamsConfig extends NodeParamsConfig {
	attributes_to_copy = ParamConfig.STRING('instance*');
	apply_material = ParamConfig.BOOLEAN(1);
	material = ParamConfig.OPERATOR_PATH('', {
		visible_if: {apply_material: 1},
		node_selection: {
			context: NodeContext.MAT,
		},
		dependent_on_found_node: false,
	});
}
const ParamsConfig = new InstanceSopParamsConfig();

export class InstanceSopNode extends TypedSopNode<InstanceSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'instance';
	}

	private _globals_handler: GlobalsGeometryHandler | undefined;
	private _geometry: BufferGeometry | undefined;

	static displayed_input_names(): string[] {
		return ['geometry to be instanciated', 'points to instance to'];
	}

	private _on_create_bound = this._on_create.bind(this);
	initialize_node() {
		super.initialize_node();

		this.lifecycle.add_on_create_hook(this._on_create_bound);

		this.io.inputs.set_count(2);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.ALWAYS, InputCloneMode.NEVER]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group_to_instance = input_contents[0];
		this._geometry = undefined;

		const object_to_instance = core_group_to_instance.objects_with_geo()[0];
		if (object_to_instance) {
			const geometry_to_instance = object_to_instance.geometry;
			if (geometry_to_instance) {
				const core_group = input_contents[1];
				this._create_instance(geometry_to_instance, core_group);
			}
		}

		// const type = object_to_instance.constructor.name;
		if (this._geometry) {
			const type = ObjectTypeByObject(object_to_instance);
			if (type) {
				const object = this.create_object(this._geometry, type);
				// object.customDepthMaterial = this._create_depth_material();

				if (this.pv.apply_material) {
					await this._apply_material(object as Mesh);
				}

				this.set_object(object);
			} else {
				this.cook_controller.end_cook();
			}
		} else {
			this.cook_controller.end_cook();
		}
	}

	async _apply_material(object: Mesh) {
		const found_node = this.p.material.found_node();
		if (found_node) {
			if (found_node.node_context() == NodeContext.MAT) {
				const material_node = found_node as BaseMatNodeType;
				this._globals_handler = this._globals_handler || new GlobalsGeometryHandler();
				const mat_builder_node = material_node as BaseBuilderMatNodeType;
				if (mat_builder_node.assembler_controller) {
					mat_builder_node.assembler_controller.set_assembler_globals_handler(this._globals_handler);
				}

				const container = await material_node.request_container();
				const material: Material = container.material();
				if (material) {
					object.material = material;
					CoreMaterial.apply_custom_materials(object, material);
				}
			} else {
				this.states.error.set('found node is not a material');
			}
		} else {
			this.states.error.set('material node invalid');
		}
	}

	_create_instance(geometry_to_instance: BufferGeometry, template_core_group: CoreGroup) {
		this._geometry = CoreInstancer.create_instance_buffer_geo(
			geometry_to_instance,
			template_core_group,
			this.pv.attributes_to_copy
		);
	}

	private _on_create() {
		const root = this.scene.root;
		const mat_type = 'materials';
		const mesh_lambert_builder_type = 'mesh_lambert_builder';
		const mat_name = 'MAT';
		const mesh_lambert_mat_name = 'mesh_lambert_builder1';
		let MAT: MaterialsObjNode | undefined;
		const node_with_mat_name = root.node(mat_name);
		if (node_with_mat_name && node_with_mat_name.type == mat_type) {
			MAT = node_with_mat_name as MaterialsObjNode;
		} else {
			MAT = root.create_node('materials');
			MAT.set_name(mat_name);
		}

		const create_mesh_lambert = (MAT: MaterialsObjNode, mesh_lambert_mat_name: string) => {
			const mat_node = MAT.create_node(mesh_lambert_builder_type);
			mat_node.set_name(mesh_lambert_mat_name);

			const instance_transform1 = mat_node.create_node('instance_transform');
			let output1 = mat_node.node('output1');
			if (!output1) {
				output1 = mat_node.create_node('output');
			}
			output1.set_input('position', instance_transform1, 'position');
			output1.set_input('normal', instance_transform1, 'normal');

			return mat_node;
		};
		const mesh_lambert_mat = MAT.node(mesh_lambert_mat_name) || create_mesh_lambert(MAT, mesh_lambert_mat_name);

		this.p.material.set(mesh_lambert_mat.full_path());
	}
}
