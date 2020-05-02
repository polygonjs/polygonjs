import {TypedSopNode} from './_Base';
import {
	AttribClass,
	AttribClassMenuEntries,
	ObjectType,
	ObjectTypeMenuEntries,
	ObjectTypes,
	object_type_from_constructor,
	AttribType,
	AttribTypeMenuEntries,
	ATTRIBUTE_TYPES,
	AttribSize,
	ATTRIBUTE_CLASSES,
	ATTRIBUTE_SIZE_RANGE,
} from '../../../core/geometry/Constant';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreObject} from '../../../core/geometry/Object';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EntitySelectionHelper} from './utils/delete/EntitySelectionHelper';
import {
	ByAttributeHelper,
	ComparisonOperatorMenuEntries,
	ComparisonOperator,
	COMPARISON_OPERATORS,
} from './utils/delete/ByAttributeHelper';
import {ByExpressionHelper} from './utils/delete/ByExpressionHelper';
import {ByBboxHelper} from './utils/delete/ByBboxHelper';
import {Object3D} from 'three/src/core/Object3D';
import {ByObjectTypeHelper} from './utils/delete/ByObjectTypeHelper';
class DeleteSopParamsConfig extends NodeParamsConfig {
	class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX), {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	invert = ParamConfig.BOOLEAN(0);
	// hide_objects = ParamConfig.BOOLEAN(0, {
	// 	visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	// });

	// by_object_type
	by_object_type = ParamConfig.BOOLEAN(0, {
		visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	});
	object_type = ParamConfig.INTEGER(ObjectTypes.indexOf(ObjectType.MESH), {
		menu: {
			entries: ObjectTypeMenuEntries,
		},
		visible_if: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
			by_object_type: true,
		},
	});
	separator_object_type = ParamConfig.SEPARATOR(null, {
		visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	});

	// by_expression
	by_expression = ParamConfig.BOOLEAN(0);
	expression = ParamConfig.BOOLEAN('@ptnum==0', {
		visible_if: {by_expression: true},
		expression: {for_entities: true},
	});
	separator_expression = ParamConfig.SEPARATOR();

	// by_attrib
	by_attrib = ParamConfig.BOOLEAN(0);
	attrib_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
		visible_if: {by_attrib: 1},
	});
	attrib_name = ParamConfig.STRING('', {
		visible_if: {by_attrib: 1},
	});
	attrib_size = ParamConfig.INTEGER(1, {
		range: ATTRIBUTE_SIZE_RANGE,
		range_locked: [true, true],
		visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC)},
	});
	attrib_comparison_operator = ParamConfig.INTEGER(COMPARISON_OPERATORS.indexOf(ComparisonOperator.EQUAL), {
		menu: {
			entries: ComparisonOperatorMenuEntries,
		},
		visible_if: {
			by_attrib: true,
			attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
			attrib_size: AttribSize.FLOAT,
		},
	});
	attrib_value1 = ParamConfig.FLOAT(0, {
		visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 1},
	});
	attrib_value2 = ParamConfig.VECTOR2([0, 0], {
		visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 2},
	});
	attrib_value3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 3},
	});
	attrib_value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 4},
	});
	attrib_string = ParamConfig.STRING('', {
		visible_if: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.STRING)},
	});
	separator_attrib = ParamConfig.SEPARATOR();

	// by_bbox
	by_bbox = ParamConfig.BOOLEAN(0, {
		visible_if: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		},
	});
	bbox_size = ParamConfig.VECTOR3([1, 1, 1], {
		visible_if: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
			by_bbox: true,
		},
	});
	bbox_center = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
			by_bbox: true,
		},
	});
	separator_bbox = ParamConfig.SEPARATOR(null, {
		visible_if: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		},
	});
	//this.add_param( ParamType.STRING, 'index_mode', Core.Geometry.Geometry.INDEX_MODE_FACES )

	// by_visible
	// by_visible = ParamConfig.BOOLEAN(0, {
	// 	visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	// });
	keep_points = ParamConfig.BOOLEAN(0, {
		visible_if: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	});
}
const ParamsConfig = new DeleteSopParamsConfig();

export class DeleteSopNode extends TypedSopNode<DeleteSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'delete';
	}

	private _marked_for_deletion_per_object_index: Map<number, boolean> = new Map();
	public readonly entity_selection_helper = new EntitySelectionHelper(this);
	public readonly by_bbox_helper = new ByBboxHelper(this);
	public readonly by_expression_helper = new ByExpressionHelper(this);
	public readonly by_attribute_helper = new ByAttributeHelper(this);
	public readonly by_object_type_helper = new ByObjectTypeHelper(this);

	static displayed_input_names(): string[] {
		return ['geometry to delete from'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.FROM_NODE);
	}

	async cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

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
		const core_objects = core_group.core_objects();
		this.entity_selection_helper.init(core_objects);

		this._marked_for_deletion_per_object_index = new Map();
		for (let core_object of core_objects) {
			this._marked_for_deletion_per_object_index.set(core_object.index, false);
		}

		if (this.pv.by_expression) {
			await this.by_expression_helper.eval_for_entities(core_objects);
		}

		if (this.pv.by_object_type) {
			this.by_object_type_helper.eval_for_objects(core_objects);
		}

		if (this.pv.by_attrib && this.pv.attrib_name != '') {
			this.by_attribute_helper.eval_for_entities(core_objects);
		}

		const core_objects_to_keep = this.entity_selection_helper.entities_to_keep() as CoreObject[];
		const objects_to_keep = core_objects_to_keep.map((co) => co.object());

		if (this.pv.keep_points) {
			const core_objects_to_delete = this.entity_selection_helper.entities_to_delete() as CoreObject[];
			for (let core_object_to_delete of core_objects_to_delete) {
				const point_object = this._point_object(core_object_to_delete);
				if (point_object) {
					objects_to_keep.push(point_object);
				}
			}
		}

		this.set_objects(objects_to_keep);
	}

	private async _eval_for_points(core_group: CoreGroup) {
		const core_objects = core_group.core_objects();
		let core_object;
		let objects: Object3D[] = [];
		for (let i = 0; i < core_objects.length; i++) {
			core_object = core_objects[i];
			let core_geometry = core_object.core_geometry();
			if (core_geometry) {
				const object = core_object.object() as Object3DWithGeometry;
				const points = core_geometry.points_from_geometry();
				this.entity_selection_helper.init(points);

				const init_points_count = points.length;
				if (this.pv.by_expression) {
					await this.by_expression_helper.eval_for_entities(points);
				}
				// TODO: the helpers do not yet take into account if an entity has been selected or not.
				// This could really speed up iterating through them, as I could skip the ones that have already been
				if (this.pv.by_attrib && this.pv.attrib_name != '') {
					this.by_attribute_helper.eval_for_entities(points);
				}
				if (this.pv.by_bbox) {
					this.by_bbox_helper.eval_for_points(points);
				}
				const kept_points = this.entity_selection_helper.entities_to_keep() as CorePoint[];

				if (kept_points.length == init_points_count) {
					objects.push(object);
				} else {
					core_geometry.geometry().dispose();
					if (kept_points.length > 0) {
						const new_geo = CoreGeometry.geometry_from_points(
							kept_points,
							object_type_from_constructor(object.constructor)
						);
						if (new_geo) {
							object.geometry = new_geo;
							objects.push(object);
						}
					}
				}
			}
		}
		this.set_objects(objects);
	}

	private _point_object(core_object: CoreObject) {
		const core_points = core_object.points();
		const geometry = CoreGeometry.geometry_from_points(
			core_points,
			object_type_from_constructor(core_object.object().constructor)
		);
		if (geometry) return this.create_object(geometry, ObjectType.POINTS);
	}
}
