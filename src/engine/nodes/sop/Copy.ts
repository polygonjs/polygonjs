/**
 * Copies a geometry onto every point from the right input.
 *
 * @remarks
 * This is different than the instance SOP, as the operation here is more expensive, but allows for more flexibility.
 *
 *
 */
import {ObjectTransformMode, ObjectTransformSpace} from './../../../core/TransformSpace';
import {SopType} from './../../poly/registers/nodes/types/Sop';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseCoreObject} from '../../../core/geometry/entities/object/BaseCoreObject';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {SopCopyStamp} from './utils/CopyStamp';
import {Matrix4} from 'three';
import {BaseCorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {
	filterCoreObjectsFromCoreGroup,
	filterObjectsWithGroup,
	filterThreejsCoreObjectsFromCoreGroup,
} from '../../../core/geometry/Mask';
import {CoreTransform, RotationOrder, TRANSFORM_TARGET_TYPES, TransformTargetType} from '../../../core/Transform';
import {OBJECT_TRANSFORM_SPACE_MENU_ENTRIES, OBJECT_TRANSFORM_SPACES} from '../../../core/TransformSpace';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {coreObjectClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';

// export enum TransformMode {
// 	OBJECT = 'object',
// 	GEOMETRY = 'geometry',
// }
// export const TRANSFORM_MODES: TransformMode[] = [TransformMode.OBJECT, TransformMode.GEOMETRY];
// const TransformModeMenuEntries = [
// 	{name: 'object', value: TRANSFORM_MODES.indexOf(TransformMode.OBJECT)},
// 	{name: 'geometry', value: TRANSFORM_MODES.indexOf(TransformMode.GEOMETRY)},
// ];

class CopySopParamsConfig extends NodeParamsConfig {
	/** @param select which objects are copied */
	srcGroup = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param select which objects the src objects are copied onto */
	templateGroup = ParamConfig.STRING('', {
		objectMask: {
			inputIndex: 1,
		},
	});
	/** @param copies count, used when the second input is not given */
	count = ParamConfig.INTEGER(1, {
		range: [1, 20],
		rangeLocked: [true, false],
	});
	/** @param translate each copy */
	t = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param rotate each copy */
	r = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param scale each copy */
	s = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param scale multiplier for each copy */
	scale = ParamConfig.FLOAT(1);
	/** @param transforms every input object each on a single input point */
	transformOnly = ParamConfig.BOOLEAN(0);
	/** @param defines if the objects or the geometries are transformed */
	transformMode = ParamConfig.INTEGER(TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECT), {
		menu: {
			entries: TRANSFORM_TARGET_TYPES.map((name, value) => ({name, value})),
		},
	});
	/** @param defines how the objects are transformed */
	objectTransformSpace = ParamConfig.INTEGER(0, {
		visibleIf: {transformMode: TRANSFORM_TARGET_TYPES.indexOf(TransformTargetType.OBJECT)},
		menu: {
			entries: OBJECT_TRANSFORM_SPACE_MENU_ENTRIES,
		},
	});
	/** @param toggles on to copy attributes from the input points to the created objects. Note that the vertex attributes from the points become object attributes */
	copyAttributes = ParamConfig.BOOLEAN(0);
	/** @param names of attributes to copy */
	attributesToCopy = ParamConfig.STRING('', {
		visibleIf: {copyAttributes: true},
	});
	/** @param toggle on to use the `copy` expression, which allows to change how the left input is evaluated for each point */
	useCopyExpr = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CopySopParamsConfig();

export class CopySopNode extends TypedSopNode<CopySopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.COPY;
	}

	private _attribNamesToCopy: string[] = [];
	private _objects: ObjectContent<CoreObjectType>[] = [];
	private _stampNode!: SopCopyStamp;

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	setTransformMode(transformMode: TransformTargetType) {
		this.p.transformMode.set(TRANSFORM_TARGET_TYPES.indexOf(transformMode));
	}
	setObjectTransformSpace(transformSpace: ObjectTransformSpace) {
		this.p.objectTransformSpace.set(OBJECT_TRANSFORM_SPACES.indexOf(transformSpace));
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		if (!isBooleanTrue(this.pv.useCopyExpr)) {
			this.stampNode().reset();
		}
		const coreGroup0 = inputCoreGroups[0];
		if (!this.io.inputs.hasInput(1)) {
			await this.cookWithoutTemplate(coreGroup0);
			return;
		}

		const coreGroup1 = inputCoreGroups[1];
		if (!coreGroup1) {
			this.states.error.set('second input invalid');
			return;
		}
		await this.cookWithTemplate(coreGroup0, coreGroup1);
		this.stampNode().reset();
	}

	private _instancer = new CoreInstancer();
	private async cookWithTemplate(instanceCoreGroup: CoreGroup, templateCoreGroup: CoreGroup) {
		this._objects = [];

		const templateCoreObjects = filterThreejsCoreObjectsFromCoreGroup(templateCoreGroup, {
			group: this.pv.templateGroup,
		});
		const templatePoints = templateCoreObjects
			// .map((o) => o.coreGeometry())
			.map((o) => pointsFromObject(o.object()))
			.flat();

		this._instancer.setCoreGroup(templateCoreGroup);

		this._attribNamesToCopy = templateCoreGroup.pointAttribNamesMatchingMask(this.pv.attributesToCopy);
		await this._copyMovedObjectsOnTemplatePoints(instanceCoreGroup, templatePoints);
		this.setObjects(this._objects);
	}

	// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
	private async _copyMovedObjectsOnTemplatePoints(instanceCoreGroup: CoreGroup, templatePoints: BaseCorePoint[]) {
		this._initAccumulatedTransform();
		for (let pointIndex = 0; pointIndex < templatePoints.length; pointIndex++) {
			await this._copyMovedObjectOnTemplatePoint(instanceCoreGroup, templatePoints, pointIndex);
			this._accumulateTransform();
		}
	}

	private _instanceMatrix = new Matrix4();
	private async _copyMovedObjectOnTemplatePoint(
		instanceCoreGroup: CoreGroup,
		templatePoints: BaseCorePoint[],
		point_index: number
	) {
		this._instancer.matrixFromPoint(templatePoints[point_index], this._instanceMatrix);
		const templatePoint = templatePoints[point_index];
		if (isBooleanTrue(this.pv.useCopyExpr)) {
			this.stampNode().setPoint(templatePoint);
		}

		const movedObjects = await this._getMovedObjectsForTemplatePoint(instanceCoreGroup, point_index);

		for (const movedObject of movedObjects) {
			if (isBooleanTrue(this.pv.copyAttributes)) {
				this._copyAttributesGromTemplate(movedObject, templatePoint);
			}

			// TODO: that node is getting inconsistent...
			// should I always only move the object?
			// and have a toggle to bake back to the geo?
			// or just enfore the use of a merge?
			if (isBooleanTrue(this.pv.transformOnly)) {
				movedObject.applyMatrix4(this._instanceMatrix);
			} else {
				this._applyMatrixToObject(movedObject, this._instanceMatrix);
			}
			this._applyAccumulatedTransform(movedObject);

			this._objects.push(movedObject);
		}
	}
	private async _getMovedObjectsForTemplatePoint(
		instanceCoreGroup: CoreGroup,
		pointIndex: number
	): Promise<ObjectContent<CoreObjectType>[]> {
		const stampedInstanceCoreGroup = await this._stampInstanceGroupIfRequired(instanceCoreGroup);
		if (stampedInstanceCoreGroup) {
			// duplicate or select from instance children
			const getObjectsForTransformOnly = () => {
				const objects = filterObjectsWithGroup(stampedInstanceCoreGroup, {group: this.pv.srcGroup});
				const object = objects[pointIndex];
				if (object) {
					return [coreObjectClassFactory(object).clone(object)];
				} else {
					return [];
				}
			};
			const movedObjects = isBooleanTrue(this.pv.transformOnly)
				? // TODO: why is doing a transform slower than cloning the input??
				  getObjectsForTransformOnly()
				: filterObjectsWithGroup(stampedInstanceCoreGroup.clone(), {group: this.pv.srcGroup});

			return movedObjects;
		} else {
			return [];
		}
	}

	private async _stampInstanceGroupIfRequired(instanceCoreGroup: CoreGroup): Promise<CoreGroup | undefined> {
		// we do not test here for pv.useCopyExpr
		// as we use the stampNode.reset() at the beginning of the cook
		// to reupdate it if necessary,
		// which can be needed when we switch from
		// useCopyExpr=true to useCopyExpr=false
		// in which case the copy() expression should return 0.
		// If we were not doing that, it would return the last evaluated value
		// if (isBooleanTrue(this.pv.useCopyExpr)) {
		const container0 = await this.containerController.requestInputContainer(0);
		if (container0) {
			const coreGroup0 = container0.coreContent();
			if (coreGroup0) {
				return coreGroup0;
			} else {
				return;
			}
		} else {
			this.states.error.set(`input failed for index ${this.stampValue()}`);
			return;
		}
		// } else {
		// 	return instanceCoreGroup;
		// }
	}

	private async _copyMovedObjectsForEachInstance(instanceCoreGroup: CoreGroup) {
		this._initAccumulatedTransform();
		for (let i = 0; i < this.pv.count; i++) {
			await this._copyMovedObjectsForInstance(instanceCoreGroup, i);
			this._accumulateTransform();
		}
	}

	private async _copyMovedObjectsForInstance(instanceCoreGroup: CoreGroup, i: number) {
		if (isBooleanTrue(this.pv.useCopyExpr)) {
			this.stampNode().setGlobalIndex(i);
		}

		const stamptedInstanceCoreGroup = await this._stampInstanceGroupIfRequired(instanceCoreGroup);
		if (stamptedInstanceCoreGroup) {
			const srcCoreObjects = filterCoreObjectsFromCoreGroup(stamptedInstanceCoreGroup, {
				group: this.pv.srcGroup,
			});
			for (const coreObject of srcCoreObjects) {
				// TODO: I should use the Core Group, to ensure that material.linewidth is properly cloned
				const clonedObject = coreObject.clone().object();
				if (clonedObject) {
					this._applyAccumulatedTransform(clonedObject);
					this._objects.push(clonedObject);
				}
			}
		}
	}

	// TODO: what if I combine both param_count and stamping?!
	private async cookWithoutTemplate(instanceCoreGroup: CoreGroup) {
		this._objects = [];
		await this._copyMovedObjectsForEachInstance(instanceCoreGroup);

		this.setObjects(this._objects);
	}

	private _copyAttributesGromTemplate(object: ObjectContent<CoreObjectType>, templatePoint: BaseCorePoint) {
		this._attribNamesToCopy.forEach((attribName, i) => {
			const attribValue = templatePoint.attribValue(attribName);
			BaseCoreObject.addAttribute(object, attribName, attribValue);
		});
	}

	//
	//
	// STAMP
	//
	//
	stampValue(attribName?: string) {
		return this.stampNode().value(attribName);
	}
	stampNode() {
		return (this._stampNode = this._stampNode || this._createStampNode());
	}
	private _createStampNode() {
		const stampNode = new SopCopyStamp(this.scene());
		// this.dirtyController.setForbiddenTriggerNodes([stampNode]);
		stampNode.setForbiddenTriggerNodes(this);
		return stampNode;
	}
	override dispose() {
		super.dispose();
		if (this._stampNode) {
			this._stampNode.dispose();
		}
	}

	//
	//
	// ACCUMULATE TRANSFORM
	//
	//
	private _coreTransform = new CoreTransform();
	private _transformAccumulatedMatrix = new Matrix4();
	private _transformMatrix = new Matrix4();
	private _initAccumulatedTransform() {
		const pv = this.pv;
		this._transformMatrix = this._coreTransform.matrix(pv.t, pv.r, pv.s, pv.scale, RotationOrder.XYZ);
		this._transformAccumulatedMatrix.identity();
	}
	private _accumulateTransform() {
		this._transformAccumulatedMatrix.multiply(this._transformMatrix);
	}
	private _applyMatrixToObject(object: ObjectContent<CoreObjectType>, matrix: Matrix4) {
		coreObjectClassFactory(object).applyMatrix(
			object,
			matrix,
			TRANSFORM_TARGET_TYPES[this.pv.transformMode],
			OBJECT_TRANSFORM_SPACES[this.pv.objectTransformSpace],
			ObjectTransformMode.MULT
		);
		// if (isObject3D(object)) {
		// 	this._applyMatrixToObjectOrGeometry(object, this._transformAccumulatedMatrix);
		// } else {
		// 	console.warn('transform cad accumulative not implemented');
		// }
		// object.matrix.multiply(this._transformAccumulatedMatrix);
		// object.matrix.decompose(object.position, object.quaternion, object.scale);
		// object.matrixAutoUpdate = false;
	}
	private _applyAccumulatedTransform(object: ObjectContent<CoreObjectType>) {
		this._applyMatrixToObject(object, this._transformAccumulatedMatrix);
		// if (isObject3D(object)) {
		// 	this._applyMatrixToObjectOrGeometry(object, this._transformAccumulatedMatrix);
		// } else {
		// 	console.warn('transform cad accumulative not implemented');
		// }
		// object.matrix.multiply(this._transformAccumulatedMatrix);
		// object.matrix.decompose(object.position, object.quaternion, object.scale);
		// object.matrixAutoUpdate = false;
	}

	//
	//
	// MATRIX OPERATIONS
	//
	//
	// private _applyMatrixToObjectOrGeometry(object: ObjectContent<CoreObjectType>, matrix: Matrix4) {
	// 	const transformMode = TRANSFORM_MODES[this.pv.transformMode];
	// 	switch (transformMode) {
	// 		case TransformMode.OBJECT: {
	// 			this._applyMatrixToObject(object, matrix);
	// 			return;
	// 		}
	// 		case TransformMode.GEOMETRY: {
	// 			const geometry = (object as Object3DWithGeometry).geometry;
	// 			if (geometry) {
	// 				geometry.applyMatrix4(matrix);
	// 			}
	// 			return;
	// 		}
	// 	}
	// 	TypeAssert.unreachable(transformMode);
	// }

	// private _object_position = new Vector3();
	// private _applyMatrixToObject(object: ObjectContent<CoreObjectType>, matrix: Matrix4) {
	// 	applyTransformWithSpaceToObject(object, matrix, OBJECT_TRANSFORM_SPACES[this.pv.objectTransformSpace]);
	// }
}
