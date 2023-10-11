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
	ObjectType,
	objectTypeFromConstructor,
	AttribType,
	AttribTypeMenuEntries,
	ATTRIBUTE_TYPES,
	AttribSize,
	ATTRIBUTE_CLASSES,
	ATTRIBUTE_SIZE_RANGE,
	ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP,
	AttribClassMenuEntriesWithoutCoreGroup,
} from '../../../core/geometry/Constant';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BaseCorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
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
import {ByObjectTypeHelper, OBJECT_TYPE_MENU_ENTRIES, OBJECT_TYPES} from './utils/delete/ByObjectTypeHelper';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {ByBoundingObjectHelper} from './utils/delete/ByBoundingObjectHelper';
import {geometryBuilder} from '../../../core/geometry/modules/three/builders/geometryBuilder';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {TypeAssert} from '../../poly/Assert';
import {primitivesFromObject} from '../../../core/geometry/entities/primitive/CorePrimitiveUtils';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CorePrimitive} from '../../../core/geometry/entities/primitive/CorePrimitive';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
class DeleteSopParamsConfig extends NodeParamsConfig {
	/** @param defines the class that should be deleted (objects or vertices) */
	class = ParamConfig.INTEGER(ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP.indexOf(AttribClass.POINT), {
		menu: {
			entries: AttribClassMenuEntriesWithoutCoreGroup,
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
	objectType = ParamConfig.INTEGER(OBJECT_TYPES.indexOf(ObjectType.MESH), {
		menu: {
			entries: OBJECT_TYPE_MENU_ENTRIES,
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
		separatorAfter: true,
	});

	// byBbox
	/** @param deletes objects that are inside a bounding box */
	byBbox = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		},
	});
	/** @param the bounding box size */
	bboxSize = ParamConfig.VECTOR3([1, 1, 1], {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
			byBbox: true,
		},
	});
	/** @param the bounding box center */
	bboxCenter = ParamConfig.VECTOR3([0, 0, 0], {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
			byBbox: true,
		},
		separatorAfter: true,
	});

	// byBoundingObject
	/** @param deletes objects that are inside an object. This uses the object from the 2nd input */
	byBoundingObject = ParamConfig.BOOLEAN(0, {
		visibleIf: {
			class: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		},
	});

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
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.DELETE;
	}

	private _markedForDeletionPerObjectIndex: Map<number, boolean> = new Map();
	public readonly entitySelectionHelper = new EntitySelectionHelper(this);
	public readonly byExpressionHelper = new ByExpressionHelper(this);
	public readonly byAttributeHelper = new ByAttributeHelper(this);
	public readonly byObjectTypeHelper = new ByObjectTypeHelper(this);
	public readonly byBboxHelper = new ByBboxHelper(this);
	public readonly byBoundingObjectHelper = new ByBoundingObjectHelper(this);

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];

		if (!coreGroup0) {
			this.cookController.endCook();
			return;
		}
		const attribClass = ATTRIBUTE_CLASSES_WITHOUT_CORE_GROUP[this.pv.class];
		switch (attribClass) {
			case AttribClass.POINT:
				return await this._evalForPoints(coreGroup0, coreGroup1);
			case AttribClass.VERTEX:
				this.states.error.set(`vertex not supported yet`);
			case AttribClass.PRIMITIVE:
				return await this._evalForPrimitives(coreGroup0, coreGroup1);
			case AttribClass.OBJECT:
				return await this._evalForObjects(coreGroup0);
			case AttribClass.CORE_GROUP:
				this.states.error.set(`core group not supported yet`);
				return;
		}
		TypeAssert.unreachable(attribClass);
	}

	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	attribClass() {
		return ATTRIBUTE_CLASSES[this.pv.class];
	}
	setAttribType(attribType: AttribType) {
		this.p.attribType.set(ATTRIBUTE_TYPES.indexOf(attribType));
	}
	attribType() {
		return ATTRIBUTE_TYPES[this.pv.attribType];
	}

	private async _evalForPoints(coreGroup: CoreGroup, core_group2?: CoreGroup) {
		const coreObjects = coreGroup.threejsCoreObjects();
		const newObjects: ObjectContent<CoreObjectType>[] = [];
		for (const coreObject of coreObjects) {
			const object = coreObject.object() as Object3DWithGeometry;
			const entities = pointsFromObject(object);
			this.entitySelectionHelper.init(entities);

			const initEntitiesCount = entities.length;
			if (isBooleanTrue(this.pv.byExpression)) {
				await this.byExpressionHelper.evalForEntities(entities);
			}
			// TODO: the helpers do not yet take into account if an entity has been selected or not.
			// This could really speed up iterating through them, as I could skip the ones that have already been
			if (isBooleanTrue(this.pv.byAttrib) && this.pv.attribName != '') {
				this.byAttributeHelper.evalForEntities(entities);
			}
			if (isBooleanTrue(this.pv.byBbox)) {
				this.byBboxHelper.evalForPoints(entities);
			}
			if (isBooleanTrue(this.pv.byBoundingObject)) {
				this.byBoundingObjectHelper.evalForPoints(entities, core_group2);
			}
			const keptEntities = this.entitySelectionHelper.entitiesToKeep() as BaseCorePoint[];

			if (keptEntities.length == initEntitiesCount) {
				newObjects.push(object);
			} else {
				if (keptEntities.length > 0) {
					const objectType = objectTypeFromConstructor(object.constructor);
					if (objectType) {
						const builder = geometryBuilder(objectType);
						if (builder) {
							const newGeo = builder.fromPoints(object, keptEntities);
							if (newGeo) {
								object.geometry = newGeo;
								newObjects.push(object);
							}
						}
					}
				}
			}
		}
		this.setObjects(newObjects);
	}

	private async _evalForPrimitives(coreGroup: CoreGroup, core_group2?: CoreGroup) {
		const objects = coreGroup.allObjects();
		const newObjects: ObjectContent<CoreObjectType>[] = [];
		for (const object of objects) {
			const entities: CorePrimitive<CoreObjectType>[] = [];
			primitivesFromObject(object, entities);
			this.entitySelectionHelper.init(entities);

			const initEntitiesCount = entities.length;
			if (isBooleanTrue(this.pv.byExpression)) {
				await this.byExpressionHelper.evalForEntities(entities);
			}
			// TODO: the helpers do not yet take into account if an entity has been selected or not.
			// This could really speed up iterating through them, as I could skip the ones that have already been
			if (isBooleanTrue(this.pv.byAttrib) && this.pv.attribName != '') {
				this.byAttributeHelper.evalForEntities(entities);
			}
			// if (isBooleanTrue(this.pv.byBbox)) {
			// 	this.byBboxHelper.evalForPoints(primitives);
			// }
			// if (isBooleanTrue(this.pv.byBoundingObject)) {
			// 	this.byBoundingObjectHelper.evalForPoints(primitives, core_group2);
			// }
			const keptEntities = this.entitySelectionHelper.entitiesToKeep() as CorePrimitive<CoreObjectType>[];

			if (keptEntities.length == initEntitiesCount) {
				newObjects.push(object);
			} else {
				if (keptEntities.length > 0) {
					const builder = keptEntities[0].builder();
					if (builder) {
						const newObject = builder(object, keptEntities);
						if (newObject) {
							newObjects.push(newObject);
						}
					}
				}
			}
		}
		this.setObjects(newObjects);
	}

	private async _evalForObjects(coreGroup: CoreGroup) {
		const coreObjects = coreGroup.allCoreObjects();
		this.entitySelectionHelper.init(coreObjects);

		this._markedForDeletionPerObjectIndex = new Map();
		for (let coreObject of coreObjects) {
			this._markedForDeletionPerObjectIndex.set(coreObject.index(), false);
		}

		if (isBooleanTrue(this.pv.byExpression)) {
			await this.byExpressionHelper.evalForEntities(coreObjects);
		}

		if (isBooleanTrue(this.pv.byObjectType)) {
			this.byObjectTypeHelper.eval_for_objects(coreObjects);
		}

		if (isBooleanTrue(this.pv.byAttrib) && this.pv.attribName != '') {
			this.byAttributeHelper.evalForEntities(coreObjects);
		}

		const coreObjectsToKeep = this.entitySelectionHelper.entitiesToKeep() as ThreejsCoreObject[];
		const objectsToKeep = coreObjectsToKeep.map((co) => co.object());

		if (isBooleanTrue(this.pv.keepPoints)) {
			const coreObjectsToDelete = this.entitySelectionHelper.entitiesToDelete() as ThreejsCoreObject[];
			for (let coreObjectToDelete of coreObjectsToDelete) {
				const pointObject = this._pointObject(coreObjectToDelete.object());
				if (pointObject) {
					objectsToKeep.push(pointObject);
				}
			}
		}

		this.setObjects(objectsToKeep);
	}

	private _pointObject<T extends CoreObjectType>(object: ObjectContent<T>) {
		const points = pointsFromObject(object);
		const builder = geometryBuilder(ObjectType.POINTS);
		if (builder) {
			const geometry = builder.fromPoints(object, points);
			if (geometry) return this.createObject(geometry, ObjectType.POINTS);
		}
	}
}
