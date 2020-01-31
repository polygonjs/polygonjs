// import {Vector3} from 'three/src/math/Vector3';
import {TypedSopNode} from './_Base';
import {CoreGroup} from 'src/core/geometry/Group';
// import {CoreGeometry} from 'src/core/geometry/Geometry';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {CoreObject} from 'src/core/geometry/Object';
import {Mesh} from 'three/src/objects/Mesh';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

// const DEFAULT_NORMAL = new Vector3(0, 0, 1);
const NORMAL_ATTRIB_NAME = 'normal';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
class NormalsSopParamsConfig extends NodeParamsConfig {
	edit = ParamConfig.BOOLEAN(0);
	update_x = ParamConfig.BOOLEAN(0, {
		visible_if: {edit: 1},
	});
	x = ParamConfig.FLOAT('@N.x', {
		visible_if: {update_x: 1, edit: 1},
		expression: {for_entities: true},
	});
	update_y = ParamConfig.BOOLEAN(0, {
		visible_if: {edit: 1},
	});
	y = ParamConfig.FLOAT('@N.y', {
		visible_if: {update_y: 1, edit: 1},
		expression: {for_entities: true},
	});
	update_z = ParamConfig.BOOLEAN(0, {
		visible_if: {edit: 1},
	});
	z = ParamConfig.FLOAT('@N.z', {
		visible_if: {update_z: 1, edit: 1},
		expression: {for_entities: true},
	});

	recompute = ParamConfig.BOOLEAN(0, {
		visible_if: {edit: 0},
	});
	invert = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new NormalsSopParamsConfig();

export class NormalsSopNode extends TypedSopNode<NormalsSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'normals';
	}

	static displayed_input_names(): string[] {
		return ['geometry to update normals of'];
	}
	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		if (this.pv.edit) {
			await this._eval_expressions_for_core_group(core_group);
		} else {
			core_group.compute_vertex_normals();
		}
		if (this.pv.invert) {
			this._invert_normals(core_group);
		}

		// add attr if not present
		// for(let object of core_group.objects()){
		// 	let geometry;
		// 	if ((geometry = object.geometry) != null) {
		// 		if(!geometry.getAttribute('normal')){
		// 			const position_values = geometry.attributes['position'].array;
		// 			const normal_values = [];
		// 			position_values.forEach(p=> normal_values.push(0));
		// 			geometry.setAttribute('normal', new Float32BufferAttribute(normal_values, 3));
		// 		}
		// 	}
		// }

		// if (this.pv.edit) {
		// 	this._eval_expressions(core_group);
		// } else {
		// 	if(this.pv.recompute){
		// 		core_group.compute_vertex_normals()
		// 	}
		// }

		// for(let object of core_group.objects()){
		// 	let geometry;
		// 	if ((geometry = object.geometry) != null) {

		// 		if (this.pv.invert) {
		// 			this._invert_normals(geometry);
		// 		}

		// 		if (!this.pv.edit) {
		// 			geometry.computeVertexNormals();
		// 		}
		// 	}
		// }

		this.set_core_group(core_group);
	}

	private async _eval_expressions_for_core_group(core_group: CoreGroup) {
		// const points = core_group.points();

		// const attrib_name = 'normal';
		// for(let point of points){

		// 	this.context().set_entity(point);

		// 	this.param(attrib_name).eval(val=> {
		// 		val.normalize();
		// 		point.set_attrib_value(attrib_name, val);
		// 	});
		// }
		const core_objects = core_group.core_objects();
		for (let i = 0; i < core_objects.length; i++) {
			await this._eval_expressions_for_core_object(core_objects[i]);
		}
	}
	private async _eval_expressions_for_core_object(core_object: CoreObject) {
		const object = core_object.object();
		const geometry = (object as Mesh).geometry as BufferGeometry;
		const points = core_object.points();

		const array = geometry.getAttribute(NORMAL_ATTRIB_NAME).array as number[];

		// x
		if (this.pv.update_x) {
			if (this.p.x.has_expression() && this.p.x.expression_controller) {
				await this.p.x.expression_controller.compute_expression_for_points(points, (point, value) => {
					array[point.index * 3 + 0] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index * 3 + 0] = this.pv.x;
				}
			}
		}
		// y
		if (this.pv.update_y) {
			if (this.p.y.has_expression() && this.p.y.expression_controller) {
				await this.p.y.expression_controller.compute_expression_for_points(points, (point, value) => {
					array[point.index * 3 + 1] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index * 3 + 1] = this.pv.y;
				}
			}
		}
		// z
		if (this.pv.update_z) {
			if (this.p.z.has_expression() && this.p.z.expression_controller) {
				await this.p.z.expression_controller.compute_expression_for_points(points, (point, value) => {
					array[point.index * 3 + 2] = value;
				});
			} else {
				let point;
				for (let i = 0; i < points.length; i++) {
					point = points[i];
					array[point.index * 3 + 2] = this.pv.z;
				}
			}
		}
	}

	// private _create_init_normal(core_geometry: CoreGeometry) {
	// 	if (!core_geometry.has_attrib(NORMAL_ATTRIB_NAME)) {
	// 		core_geometry.add_numeric_attrib(NORMAL_ATTRIB_NAME, 3, DEFAULT_NORMAL);
	// 	}
	// }

	private _invert_normals(core_group: CoreGroup) {
		// this._create_init_normal();

		for (let core_object of core_group.core_objects()) {
			const geometry = core_object.core_geometry().geometry();
			const normal_attrib = geometry.attributes[NORMAL_ATTRIB_NAME];
			if (normal_attrib) {
				const array = normal_attrib.array as number[];
				for (let i = 0; i < array.length; i++) {
					array[i] *= -1;
				}
			}
		}
		// let index_attrib;
		// if ((index_attrib = geometry.getIndex()) != null) {
		// 	const { array } = index_attrib;

		// 	const faces_count = array.length / 3;
		// 	for(let i=0; i<faces_count; i++){
		// 		const tmp = array[i*3];
		// 		array[i*3] = array[(i*3)+2];
		// 		array[(i*3)+2] = tmp;
		// 	}

		// } else {
		// 	const geometry_wrapper = new CoreGeometry(geometry);
		// 	const points = geometry_wrapper.points();

		// 	const attrib_name = 'normal';
		// 	for(let point of points){
		// 		const normal = point.normal();
		// 		normal.multiplyScalar(-1);
		// 		point.set_attrib_value(attrib_name, normal);
		// 	}
		// }
	}
}
