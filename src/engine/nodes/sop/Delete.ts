/**
 * Delete parts of the input geometry
 *
 * @remarks
 * This can be used in many ways to delete points or objects from the input.
 *
 */
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
	/** @param defines the class that should be deleted (objects or vertices) */
	class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX), {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param invert the selection created in the parameters below */
	invert = ParamConfig.BOOLEAN(0);
	// hide_objects = ParamConfig.BOOLEAN(0, {
	// 	visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	// });

	// by_object_type
	/** @param deletes objects by object type */
	by_object_type = ParamConfig.BOOLEAN(0, {
		visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	});
	/** @param sets which object types should be deleted */
	object_type = ParamConfig.INTEGER(ObjectTypes.indexOf(ObjectType.MESH), {
		menu: {
			entries: ObjectTypeMenuEntries,
		},
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
			by_object_type: true,
		},
	});
	separator_object_type = ParamConfig.SEPARATOR(null, {
		visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	});

	// by_expression
	/** @param deletes objects by an expression */
	by_expression = ParamConfig.BOOLEAN(0);
	/** @param sets the expression to select what should be deleted */
	expression = ParamConfig.BOOLEAN('@ptnum==0', {
		visibleIf: {by_expression: true},
		expression: {forEntities: true},
	});
	separator_expression = ParamConfig.SEPARATOR();

	// by_attrib
	/** @param deletes objects by an attribute */
	by_attrib = ParamConfig.BOOLEAN(0);
	/** @param sets the type of the attribute for which items should be deleted */
	attrib_type = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
		visibleIf: {by_attrib: 1},
	});
	/** @param name of the attribute used */
	attrib_name = ParamConfig.STRING('', {
		visibleIf: {by_attrib: 1},
	});
	/** @param size of the attribute used */
	attrib_size = ParamConfig.INTEGER(1, {
		range: ATTRIBUTE_SIZE_RANGE,
		rangeLocked: [true, true],
		visibleIf: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC)},
	});
	/** @param comparison operator */
	attrib_comparison_operator = ParamConfig.INTEGER(COMPARISON_OPERATORS.indexOf(ComparisonOperator.EQUAL), {
		menu: {
			entries: ComparisonOperatorMenuEntries,
		},
		visibleIf: {
			by_attrib: true,
			attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
			attrib_size: AttribSize.FLOAT,
		},
	});
	/** @param value of the attribute to compare with (when using float attribute) */
	attrib_value1 = ParamConfig.FLOAT(0, {
		visibleIf: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 1},
	});
	/** @param value of the attribute to compare with (when using vector2 attribute) */
	attrib_value2 = ParamConfig.VECTOR2([0, 0], {
		visibleIf: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 2},
	});
	/** @param value of the attribute to compare with (when using vector3 attribute) */
	attrib_value3 = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 3},
	});
	/** @param value of the attribute to compare with (when using vector4 attribute) */
	attrib_value4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visibleIf: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attrib_size: 4},
	});
	/** @param value of the attribute to compare with (when using string attribute) */
	attrib_string = ParamConfig.STRING('', {
		visibleIf: {by_attrib: 1, attrib_type: ATTRIBUTE_TYPES.indexOf(AttribType.STRING)},
	});
	separator_attrib = ParamConfig.SEPARATOR();

	// by_bbox
	/** @param deletes objects that are inside a bounding box */
	by_bbox = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		},
	});
	/** @param the bounding box size */
	bbox_size = ParamConfig.VECTOR3([1, 1, 1], {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
			by_bbox: true,
		},
	});
	/** @param the bounding box center */
	bbox_center = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
			by_bbox: true,
		},
	});
	separator_bbox = ParamConfig.SEPARATOR(null, {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		},
	});
	//this.add_param( ParamType.STRING, 'index_mode', Core.Geometry.Geometry.INDEX_MODE_FACES )

	// by_visible
	// by_visible = ParamConfig.BOOLEAN(0, {
	// 	visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	// });
	/** @param keeps points */
	keep_points = ParamConfig.BOOLEAN(0, {
		visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
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

	set_class(attrib_class: AttribClass) {
		this.p.class.set(attrib_class);
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
		const geometry = CoreGeometry.geometry_from_points(core_points, ObjectType.POINTS);
		if (geometry) return this.create_object(geometry, ObjectType.POINTS);
	}
}
