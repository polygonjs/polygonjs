import {Box3} from 'three/src/math/Box3';
import lodash_isString from 'lodash/isString';
import lodash_each from 'lodash/each';
import {TypedSopNode} from './_Base';
import {CoreString} from '../../../core/String';
import {
	AttribClass,
	AttribClassMenuEntries,
	ObjectType,
	ObjectTypeMenuEntries,
	ObjectTypes,
} from '../../../core/geometry/Constant';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreObject} from '../../../core/geometry/Object';

enum ComparisonOperator {
	'==' = 0,
	'<' = 1,
	'<=' = 2,
	'>=' = 3,
	'>' = 4,
	'!=' = 5,
}
const ComparisonOperatorMenuEntries = [
	{name: '==', value: ComparisonOperator['==']},
	{name: '<', value: ComparisonOperator['<']},
	{name: '<=', value: ComparisonOperator['<=']},
	{name: '>=', value: ComparisonOperator['>=']},
	{name: '>', value: ComparisonOperator['>']},
	{name: '!=', value: ComparisonOperator['!=']},
];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class DeleteSopParamsConfig extends NodeParamsConfig {
	class = ParamConfig.INTEGER(AttribClass.VERTEX, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	invert = ParamConfig.BOOLEAN(0);
	hide_objects = ParamConfig.BOOLEAN(0);

	// by_object_type
	by_object_type = ParamConfig.BOOLEAN(0);
	object_type = ParamConfig.INTEGER(ObjectTypes.indexOf(ObjectType.MESH), {
		menu: {
			entries: ObjectTypeMenuEntries,
		},
		visible_if: {by_object_type: true},
	});

	// by_expression
	by_expression = ParamConfig.BOOLEAN(0);
	expression = ParamConfig.BOOLEAN('@ptnum==0', {
		visible_if: {by_expression: true},
		expression: {for_entities: true},
	});

	// by_attrib
	by_attrib = ParamConfig.BOOLEAN(0);
	attrib_name = ParamConfig.STRING('', {
		visible_if: {by_attrib: true},
	});
	attrib_string = ParamConfig.STRING('', {
		visible_if: {by_attrib: true},
	});
	// attrib_float = ParamConfig.FLOAT(0, {
	// 	visible_if: {by_attrib: true},
	// })
	attrib_numeric = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visible_if: {by_attrib: true},
	});
	attrib_comparison_operator = ParamConfig.INTEGER(ComparisonOperator['=='], {
		menu: {
			entries: ComparisonOperatorMenuEntries,
		},
		visible_if: {by_attrib: true},
	});

	// by_bbox
	by_bbox = ParamConfig.BOOLEAN(0);
	bbox_size = ParamConfig.VECTOR3([1, 1, 1], {
		visible_if: {by_bbox: true},
	});
	bbox_center = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {by_bbox: true},
	});
	//this.add_param( ParamType.STRING, 'index_mode', Core.Geometry.Geometry.INDEX_MODE_FACES )

	// by_visible
	by_visible = ParamConfig.BOOLEAN(0);
	keep_points = ParamConfig.BOOLEAN(1, {
		visible_if: {
			class: AttribClass.OBJECT,
		},
	});
}
const ParamsConfig = new DeleteSopParamsConfig();

export class DeleteSopNode extends TypedSopNode<DeleteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'delete';
	}

	// _param_attrib_class: number;
	// _param_invert: boolean;
	// _param_hide_objects: boolean;
	// _param_by_object_type: boolean;
	// _param_object_type: number;
	// _param_by_attrib: boolean;
	// _param_attrib_name: string;
	// _param_attrib_float: number;
	// _param_attrib_string: string;
	// _param_attrib_vector: Vector3;
	// _param_attrib_ComparisonOperator: number;
	// _param_by_expression: boolean;
	// _param_expression: string;
	// _param_by_bbox: boolean;
	// _param_bbox_size: Vector3;
	// _param_bbox_center: Vector3;
	// _param_by_visible: boolean;

	private _bbox_cache: Box3 | undefined;

	private _marked_for_deletion_per_object_index: Map<number, boolean> = new Map();

	static displayed_input_names(): string[] {
		return ['geometry to delete from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		this._bbox_cache = undefined;
		switch (this.pv.class) {
			case AttribClass.VERTEX:
				await this._eval_for_points(core_group);
				break;
			case AttribClass.OBJECT:
				await this._eval_for_objects(core_group);
				break;
		}
	}

	private async _eval_for_objects(core_group: CoreGroup) {
		// const objects_to_delete = [];
		const objects_to_keep = [];
		const core_objects = core_group.core_objects();

		this._marked_for_deletion_per_object_index = new Map();
		for (let core_object of core_objects) {
			this._marked_for_deletion_per_object_index.set(core_object.index, false);
		}

		if (this.pv.by_expression) {
			await this._eval_expressions_for_objects(core_objects);
		}

		if (this.pv.by_object_type) {
			this._eval_type_for_objects(core_objects);
		}

		if (this.pv.by_attrib && this.pv.attrib_name !== '') {
			this._eval_attrib_for_objects(core_objects);

			// 	if !is_deleted && @_param_by_bbox
			// 		is_deleted = this._eval_bbox_for_object(object)

			// 	if !is_deleted && @_param_by_visible
			// 		is_deleted = !object.visible

			// 	if @_param_invert
			// 		is_deleted = !is_deleted

			// 	if @_param_hide_objects
			// 		object.visible = !is_deleted
			// 	else
			// 		if is_deleted
			// 			objects_to_delete.push(object)

			// true; // to ensure the loop isn't breaking, which is what happens when setting the object.visible to false...
		}

		if (this.pv.invert) {
			this._marked_for_deletion_per_object_index.forEach((marked_for_deletion, object_index) => {
				this._marked_for_deletion_per_object_index.set(object_index, !marked_for_deletion);
			});
		}

		let core_object, object;
		const point_objects_from_deleted_objects: Object3DWithGeometry[] = [];
		// for (let object_index of Object.keys(this._marked_for_deletion_per_object_index)) {
		this._marked_for_deletion_per_object_index.forEach((marked_for_deletion, object_index) => {
			core_object = core_objects[object_index];
			object = core_object.object();

			if (this.pv.hide_objects) {
				objects_to_keep.push(object);
				if (marked_for_deletion) {
					object.visible = false;
				}
			} else {
				if (!marked_for_deletion) {
					objects_to_keep.push(object);
				}
				if (marked_for_deletion) {
					point_objects_from_deleted_objects.push(this._point_object(core_object));
				}
			}
			// if (marked_for_deletion) {
			// 	cmptr += 1;
			// 	if (this.pv.hide_objects) {
			// 		object.visible = true;

			// 	} else {
			// 		// object.parent.remove(object);
			// 		// const c = () =>
			// 		// 	object.traverse(function(object_child) {
			// 		// 		if (object_child.geometry != null) {
			// 		// 			object_child.geometry.dispose();
			// 		// 		}
			// 		// 		// const material = object_child.material
			// 		// 		// if(material){ material.dispose() }
			// 		// 	})
			// 		// ;
			// 		// setTimeout(c, 25);
			// 	}
			// }
		});

		for (let object of point_objects_from_deleted_objects) {
			objects_to_keep.push(object);
		}

		this.set_objects(objects_to_keep);
	}

	//console.log("#{cmptr} marked for deletion")

	// TODO: ensure that geometries with no remaining points are removed from the group
	private async _eval_for_points(core_group: CoreGroup) {
		const core_objects = core_group.core_objects();
		let core_object;
		for (let i = 0; i < core_objects.length; i++) {
			core_object = core_objects[i];
			let core_geometry = core_object.core_geometry();
			if (core_geometry) {
				let points = core_geometry.points_from_geometry();
				const init_points_count = points.length;
				if (this.pv.by_expression) {
					points = await this._eval_expressions_for_points(points);
				}

				if (this.pv.by_attrib && this.pv.attrib_name !== '') {
					points = this._eval_attrib_for_points(points);
				}
				if (this.pv.by_bbox) {
					points = this._eval_bbox_for_points(points);
				}

				if (points.length != init_points_count) {
					const object = core_object.object() as Object3DWithGeometry;
					core_geometry.geometry().dispose();
					if (points.length > 0) {
						// TODO: if the new geo only has unconnected points, how do I know it and how do I change the material if it was previously a mesh?
						object.geometry = CoreGeometry.geometry_from_points(
							points,
							(<unknown>object.constructor) as ObjectType
						);
					} else {
						// TODO: do not dispose material if not cloned
						// if (object.material != null) {
						// 	object.material.dispose();
						// }
						object.parent != null ? object.parent.remove(object) : undefined;
					}
				}
			}
		}

		this.set_core_group(core_group);
	}

	private async _eval_expressions_for_points(points: CorePoint[]) {
		const kept_points = [];

		// const promises = points.map((point, i)=> {
		// 	return new Promise( async (resolve, reject)=> {
		// 		this.context().set_entity(point);
		// 		const val = await(this.param('expression').eval_p());
		// 		const keep_point = this.pv.invert ?
		// 			val === true
		// 		:
		// 			val === false;

		// 		if (keep_point) {
		// 			kept_points.push(point);
		// 		}
		// 		resolve();
		// 	});
		// });

		// await(Promise.all(promises));
		const param = this.p.expression;
		if (this.p.expression.has_expression() && param.expression_controller) {
			await param.expression_controller.compute_expression_for_points(points, (point, value) => {
				let keep_point = !value;
				if (this.pv.invert) {
					keep_point = !keep_point;
				}
				if (keep_point) {
					kept_points.push(point);
				}
			});
		} else {
			const value = this.pv.expression;
			let keep_point = !value;
			if (this.pv.invert) {
				keep_point = !keep_point;
			}
			for (let i = 0; i < points.length; i++) {
				if (keep_point) {
					kept_points.push(points[i]);
				}
			}
		}
		console.log(kept_points);
		return kept_points;
	}

	private async _eval_expressions_for_objects(core_objects: CoreObject[]) {
		const param = this.p.expression;

		if (param.has_expression() && param.expression_controller) {
			await param.expression_controller.compute_expression_for_objects(core_objects, (core_object, value) => {
				const is_marked_for_deletion = this._marked_for_deletion_per_object_index.get(core_object.index);
				if (!is_marked_for_deletion) {
					this._marked_for_deletion_per_object_index.set(core_object.index, value);
				}
			});
		} else {
			for (let core_object of core_objects) {
				this._marked_for_deletion_per_object_index.set(core_object.index, param.value);
			}
		}

		// for (let core_object of core_objects) {
		// 	const is_marked_for_deletion = this._marked_for_deletion_per_object_index.get(core_object.index);

		// 	if (!is_marked_for_deletion) {
		// 		this.processing_context.set_entity(core_object);
		// 		// param.set_dirty();
		// 		await param.compute();
		// 		this._marked_for_deletion_per_object_index.set(core_object.index, param.value);
		// 	}
		// }
	}

	private _eval_attrib_for_points(points: CorePoint[]) {
		const kept_points: CorePoint[] = [];

		if (points.length > 0) {
			const first_attrib_value = points[0].attrib_value(this.pv.attrib_name);
			// TODO: should I just have @_param_attrib_string?
			// although I may need a vector one... maybe a multiple string?
			const comparison_attrib_values = lodash_isString(first_attrib_value)
				? //@_param_attrib_string
				  CoreString.attrib_names(this.pv.attrib_string)
				: [this.pv.attrib_numeric.x];

			comparison_attrib_values.forEach((comparison_attrib_value: string | number) => {
				return points.forEach((point) => {
					const attrib_value = point.attrib_value(this.pv.attrib_name);

					// TODO: and for vectors? should I have a point.attrib(name).is_equal(value)
					// or point.is_attrib_equal(name, value) ?
					//keep_point = (attrib_value != comparison_attrib_value)
					let keep_point = !this._comparison(attrib_value, comparison_attrib_value);

					if (this.pv.invert) {
						keep_point = !keep_point;
					}

					if (keep_point) {
						return kept_points.push(point);
					}
				});
			});
		}

		return kept_points;
	}

	private _comparison(attrib_value: number | string, comparison_attrib_value: number | string) {
		switch (this.pv.attrib_ComparisonOperator) {
			case ComparisonOperator['==']:
				return attrib_value === comparison_attrib_value;
			case ComparisonOperator['<=']:
				return attrib_value <= comparison_attrib_value;
			case ComparisonOperator['<']:
				return attrib_value < comparison_attrib_value;
			case ComparisonOperator['>']:
				return attrib_value > comparison_attrib_value;
			case ComparisonOperator['>=']:
				return attrib_value >= comparison_attrib_value;
			case ComparisonOperator['!=']:
				return attrib_value !== comparison_attrib_value;
		}
	}

	private _eval_type_for_objects(core_objects: CoreObject[]) {
		const object_type_name = ObjectTypes[this.pv.object_type];

		for (let core_object of core_objects) {
			const is_marked_for_deletion = this._marked_for_deletion_per_object_index.get(core_object.index);

			if (!is_marked_for_deletion) {
				const object = core_object.object();

				if (object.constructor.name === object_type_name) {
					this._marked_for_deletion_per_object_index.set(core_object.index, true);
				}
			}
		}
	}

	private _eval_attrib_for_objects(core_objects: CoreObject[]) {
		for (let core_object of core_objects) {
			const is_marked_for_deletion = this._marked_for_deletion_per_object_index.get(core_object.index);

			if (!is_marked_for_deletion) {
				// const object = core_object.object();
				const attrib_value = core_object.attrib_value(this.pv.attrib_name);

				const comparison_attrib_value = lodash_isString(attrib_value)
					? this.pv.attrib_string
					: this.pv.attrib_float;

				if (attrib_value === comparison_attrib_value) {
					this._marked_for_deletion_per_object_index.set(core_object.index, true);
				}
			}
		}
	}

	private _eval_bbox_for_points(points: CorePoint[]) {
		const kept_points: CorePoint[] = [];

		lodash_each(points, (point, i) => {
			const in_bbox = this._bbox.containsPoint(point.position());

			const keep_point = this.pv.invert ? in_bbox : !in_bbox;

			if (keep_point) {
				return kept_points.push(point);
			}
		});

		return kept_points;
	}

	// private _eval_bbox_for_object(object: Object3D): boolean {
	// 	const object_bbox = new Box3().setFromObject(object);
	// 	const center = new Vector3();
	// 	object_bbox.getCenter(center);

	// 	return this.pv.bbox().containsPoint(center);
	// }

	private get _bbox() {
		return this._bbox_cache != null
			? this._bbox_cache
			: (this._bbox_cache = new Box3(
					this.pv.bbox_center.clone().sub(this.pv.bbox_size.clone().multiplyScalar(0.5)),
					this.pv.bbox_center.clone().add(this.pv.bbox_size.clone().multiplyScalar(0.5))
			  ));
	}

	private _point_object(core_object: CoreObject) {
		const core_points = core_object.points();
		const geometry = CoreGeometry.geometry_from_points(
			core_points,
			(<unknown>core_object.object().constructor) as ObjectType
		);
		return this.create_object(geometry, ObjectType.POINTS);
	}
}
