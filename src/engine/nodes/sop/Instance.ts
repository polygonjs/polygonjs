// import {TypedSopNode} from './_Base';

// import {CoreGroup} from '../../../core/geometry/Group';
// import {CoreInstancer} from '../../../core/geometry/Instancer';
// import {CoreMaterial} from '../../../core/geometry/Material';
// import {GlobalsGeometryHandler} from '../../../Engine/Node/Gl/Assembler/Globals/Geometry';
// import {NodeContext} from '../../../Engine/Poly';

// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class InstanceSopParamsConfig extends NodeParamsConfig {
// 	class = ParamConfig.INTEGER(AttribClass.VERTEX, {
// 		menu: {
// 			entries: AttribClassMenuEntries,
// 		},
// 	});
// 	name = ParamConfig.STRING('');
// }
// const ParamsConfig = new InstanceSopParamsConfig();

// export class InstanceSopNode extends TypedSopNode<InstanceSopParamsConfig> {
// 	params_config = ParamsConfig;
// 	static type() {
// 		return 'instance';
// 	}

// 	_param_apply_material: boolean;
// 	_param_attributes_to_copy: string;

// 	_globals_handler: GlobalsGeometryHandler;

// 	static displayed_input_names(): string[] {
// 		return ['geometry to be instanciated', 'points to instance to'];
// 	}

// 	constructor() {
// 		super();

// 		this.set_inputs_count(2);
// 		this.init_inputs_clonable_state([POLY.InputCloneMode.ALWAYS, POLY.InputCloneMode.NEVER]);
// 	}

// 	create_params() {
// 		// this.add_param( 'operator_path', 'material', '/MAT/mesh_lambert_instance1' )
// 		this.add_param(ParamType.STRING, 'attributes_to_copy', 'instance*');
// 		this.add_param(ParamType.TOGGLE, 'apply_material', 1);
// 		this.add_param(ParamType.OPERATOR_PATH, 'material', '', {
// 			visible_if: {apply_material: 1},
// 			node_selection: {
// 				context: NodeContext.MAT,
// 			},
// 			dependent_on_found_node: false,
// 		});
// 		// this.add_param(ParamType.TOGGLE, 'add_uv_offset', '');
// 	}

// 	async cook(input_contents) {
// 		let object_to_instance;
// 		const core_group_to_instance = input_contents[0];
// 		this._geometry = null;

// 		if ((object_to_instance = core_group_to_instance.objects()[0]) != null) {
// 			let geometry_to_instance;
// 			if ((geometry_to_instance = object_to_instance.geometry) != null) {
// 				const core_group = input_contents[1];
// 				this._create_instance(geometry_to_instance, core_group);
// 			}
// 		}

// 		// const type = object_to_instance.constructor.name;
// 		const type = object_to_instance.constructor.name;
// 		const object = this.create_object(this._geometry, type);
// 		// object.customDepthMaterial = this._create_depth_material();

// 		if (this._param_apply_material) {
// 			await this._apply_material(object);
// 		}

// 		this.set_object(object);
// 	}

// 	async _apply_material(object) {
// 		const material_node = this.param('material').found_node();
// 		if (material_node) {
// 			this._globals_handler = this._globals_handler || new GlobalsGeometryHandler();
// 			if (material_node.set_assembler_globals_handler) {
// 				material_node.set_assembler_globals_handler(this._globals_handler);
// 			}

// 			const container = await material_node.request_container_p();
// 			const material = container.material();
// 			if (material) {
// 				object.material = material;
// 				CoreMaterial.apply_custom_materials(object, material);
// 			}
// 		} else {
// 			this.set_error('material node invalid');
// 		}
// 	}

// 	_create_instance(geometry_to_instance, template_core_group: CoreGroup) {
// 		this._geometry = CoreInstancer.create_instance_buffer_geo(
// 			geometry_to_instance,
// 			template_core_group,
// 			this._param_attributes_to_copy
// 		);
// 	}

// 	on_create() {
// 		const root = this.scene().root();
// 		const mat_name = 'MAT';
// 		const mesh_lambert_mat_name = 'mesh_lambert_instances';
// 		const MAT = root.node(mat_name) || scene.root().create_node('materials');
// 		MAT.set_name(mat_name);

// 		const create_mesh_lambert = (MAT, mesh_lambert_mat_name) => {
// 			const mat_node = MAT.create_node('mesh_lambert');
// 			mat_node.set_name(mesh_lambert_mat_name);

// 			const instance_transform1 = mat_node.create_node('instance_transform');
// 			const output1 = mat_node.node('output1');
// 			output1.set_input('position', instance_transform1, 'position');
// 			output1.set_input('normal', instance_transform1, 'normal');

// 			return mat_node;
// 		};
// 		const mesh_lambert_mat = MAT.node(mesh_lambert_mat_name) || create_mesh_lambert(MAT, mesh_lambert_mat_name);

// 		this.param('material').set(mesh_lambert_mat.full_path());
// 	}
// }
