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
	objectTypeFromConstructor,
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
import {isBooleanTrue} from '../../../core/BooleanValue';
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

	// byObjectType
	/** @param deletes objects by object type */
	byObjectType = ParamConfig.BOOLEAN(0, {
		visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	});
	/** @param sets which object types should be deleted */
	objectType = ParamConfig.INTEGER(ObjectTypes.indexOf(ObjectType.MESH), {
		menu: {
			entries: ObjectTypeMenuEntries,
		},
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
			byObjectType: true,
		},
		separatorAfter: true,
	});

	// byExpression
	/** @param deletes objects by an expression */
	byExpression = ParamConfig.BOOLEAN(0);
	/** @param sets the expression to select what should be deleted */
	expression = ParamConfig.BOOLEAN('@ptnum==0', {
		visibleIf: {byExpression: true},
		expression: {forEntities: true},
		separatorAfter: true,
	});

	// byAttrib
	/** @param deletes objects by an attribute */
	byAttrib = ParamConfig.BOOLEAN(0);
	/** @param sets the type of the attribute for which items should be deleted */
	attribType = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
		visibleIf: {byAttrib: 1},
	});
	/** @param name of the attribute used */
	attribName = ParamConfig.STRING('', {
		visibleIf: {byAttrib: 1},
	});
	/** @param size of the attribute used */
	attribSize = ParamConfig.INTEGER(1, {
		range: ATTRIBUTE_SIZE_RANGE,
		rangeLocked: [true, true],
		visibleIf: {byAttrib: 1, attribType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC)},
	});
	/** @param comparison operator */
	attribComparisonOperator = ParamConfig.INTEGER(COMPARISON_OPERATORS.indexOf(ComparisonOperator.EQUAL), {
		menu: {
			entries: ComparisonOperatorMenuEntries,
		},
		visibleIf: {
			byAttrib: true,
			attribType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
			attribSize: AttribSize.FLOAT,
		},
	});
	/** @param value of the attribute to compare with (when using float attribute) */
	attribValue1 = ParamConfig.FLOAT(0, {
		visibleIf: {byAttrib: 1, attribType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attribSize: 1},
	});
	/** @param value of the attribute to compare with (when using vector2 attribute) */
	attribValue2 = ParamConfig.VECTOR2([0, 0], {
		visibleIf: {byAttrib: 1, attribType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attribSize: 2},
	});
	/** @param value of the attribute to compare with (when using vector3 attribute) */
	attribValue3 = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {byAttrib: 1, attribType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attribSize: 3},
	});
	/** @param value of the attribute to compare with (when using vector4 attribute) */
	attribValue4 = ParamConfig.VECTOR4([0, 0, 0, 0], {
		visibleIf: {byAttrib: 1, attribType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), attribSize: 4},
	});
	/** @param value of the attribute to compare with (when using string attribute) */
	attribString = ParamConfig.STRING('', {
		visibleIf: {byAttrib: 1, attribType: ATTRIBUTE_TYPES.indexOf(AttribType.STRING)},
	});

	// byBbox
	/** @param deletes objects that are inside a bounding box */
	byBbox = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
		},
	});
	/** @param the bounding box size */
	bboxSize = ParamConfig.VECTOR3([1, 1, 1], {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
			byBbox: true,
		},
	});
	/** @param the bounding box center */
	bboxCenter = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.VERTEX),
			byBbox: true,
		},
		separatorAfter: true,
	});
	//this.add_param( ParamType.STRING, 'index_mode', Core.Geometry.Geometry.INDEX_MODE_FACES )

	// by_visible
	// by_visible = ParamConfig.BOOLEAN(0, {
	// 	visibleIf: {class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT)},
	// });
	/** @param keeps points */
	keepPoints = ParamConfig.BOOLEAN(0, {
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
	public readonly byBbox_helper = new ByBboxHelper(this);
	public readonly byExpression_helper = new ByExpressionHelper(this);
	public readonly byAttribute_helper = new ByAttributeHelper(this);
	public readonly byObjectType_helper = new ByObjectTypeHelper(this);

	static displayedInputNames(): string[] {
		return ['geometry to delete from'];
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
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
		const core_objects = core_group.coreObjects();
		this.entity_selection_helper.init(core_objects);

		this._marked_for_deletion_per_object_index = new Map();
		for (let core_object of core_objects) {
			this._marked_for_deletion_per_object_index.set(core_object.index(), false);
		}

		if (isBooleanTrue(this.pv.byExpression)) {
			await this.byExpression_helper.eval_for_entities(core_objects);
		}

		if (isBooleanTrue(this.pv.byObjectType)) {
			this.byObjectType_helper.eval_for_objects(core_objects);
		}

		if (isBooleanTrue(this.pv.byAttrib) && this.pv.attribName != '') {
			this.byAttribute_helper.eval_for_entities(core_objects);
		}

		const core_objects_to_keep = this.entity_selection_helper.entities_to_keep() as CoreObject[];
		const objects_to_keep = core_objects_to_keep.map((co) => co.object());

		if (isBooleanTrue(this.pv.keepPoints)) {
			const core_objects_to_delete = this.entity_selection_helper.entities_to_delete() as CoreObject[];
			for (let core_object_to_delete of core_objects_to_delete) {
				const point_object = this._point_object(core_object_to_delete);
				if (point_object) {
					objects_to_keep.push(point_object);
				}
			}
		}

		this.setObjects(objects_to_keep);
	}

	private async _eval_for_points(core_group: CoreGroup) {
		const core_objects = core_group.coreObjects();
		let core_object;
		let objects: Object3D[] = [];
		for (let i = 0; i < core_objects.length; i++) {
			core_object = core_objects[i];
			let core_geometry = core_object.coreGeometry();
			if (core_geometry) {
				const object = core_object.object() as Object3DWithGeometry;
				const points = core_geometry.pointsFromGeometry();
				this.entity_selection_helper.init(points);

				const init_points_count = points.length;
				if (isBooleanTrue(this.pv.byExpression)) {
					await this.byExpression_helper.eval_for_entities(points);
				}
				// TODO: the helpers do not yet take into account if an entity has been selected or not.
				// This could really speed up iterating through them, as I could skip the ones that have already been
				if (isBooleanTrue(this.pv.byAttrib) && this.pv.attribName != '') {
					this.byAttribute_helper.eval_for_entities(points);
				}
				if (isBooleanTrue(this.pv.byBbox)) {
					this.byBbox_helper.eval_for_points(points);
				}
				const kept_points = this.entity_selection_helper.entities_to_keep() as CorePoint[];

				if (kept_points.length == init_points_count) {
					objects.push(object);
				} else {
					core_geometry.geometry().dispose();
					if (kept_points.length > 0) {
						const new_geo = CoreGeometry.geometryFromPoints(
							kept_points,
							objectTypeFromConstructor(object.constructor)
						);
						if (new_geo) {
							object.geometry = new_geo;
							objects.push(object);
						}
					}
				}
			}
		}
		this.setObjects(objects);
	}

	private _point_object(core_object: CoreObject) {
		const core_points = core_object.points();
		const geometry = CoreGeometry.geometryFromPoints(core_points, ObjectType.POINTS);
		if (geometry) return this.createObject(geometry, ObjectType.POINTS);
	}
}
