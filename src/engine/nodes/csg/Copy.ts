/**
 * Copies a geometry onto every point from the right input.
 *
 *
 *
 */

import {TypedCsgNode} from './_Base';
import {CsgCopyStamp} from './utils/CsgCopyStamp';
import {Matrix4, Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CoreTransform, RotationOrder} from '../../../core/Transform';
import {CsgCoreObject, CsgObject} from '../../../core/geometry/csg/CsgCoreObject';
import {csgApplyMatrix4} from '../../../core/geometry/csg/math/CsgMat4';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {CoreCsgInstancer} from '../../../core/geometry/csg/utils/CsgInstancer';

class CopyCsgParamsConfig extends NodeParamsConfig {
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
	/** @param toggle on to use the `copy` expression, which allows to change how the left input is evaluated for each point */
	useCopyExpr = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new CopyCsgParamsConfig();

export class CopyCsgNode extends TypedCsgNode<CopyCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'copy';
	}

	private _objects: CsgObject[] = [];
	private _stampNode!: CsgCopyStamp;

	static override displayedInputNames(): string[] {
		return ['geometry to be copied', 'points to copy to (optional)'];
	}

	override initializeNode() {
		this.io.inputs.setCount(1, 2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override async cook(inputCoreGroups: CsgCoreGroup[]) {
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
	}

	private _instancer = new CoreCsgInstancer();
	private async cookWithTemplate(instanceCoreGroup: CsgCoreGroup, template_core_group: CsgCoreGroup) {
		this._objects = [];

		const templatePoints = template_core_group.points();

		// this._instancer.setCoreGroup(template_core_group);

		await this._copyMovedObjectsOnTemplatePoints(instanceCoreGroup, templatePoints);
		this.setCsgCoreObjects(this._objects);
	}

	// https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
	private async _copyMovedObjectsOnTemplatePoints(instanceCoreGroup: CsgCoreGroup, templatePoints: Vector3[]) {
		this._initAccumulatedTransform();
		for (let point_index = 0; point_index < templatePoints.length; point_index++) {
			await this._copyMovedObjectOnTemplatePoint(instanceCoreGroup, templatePoints, point_index);
			this._accumulateTransform();
		}
	}

	private _instanceMatrix = new Matrix4();
	private async _copyMovedObjectOnTemplatePoint(
		instanceCoreGroup: CsgCoreGroup,
		template_points: Vector3[],
		point_index: number
	) {
		this._instancer.matrixFromPoint(template_points[point_index], this._instanceMatrix);
		//const templatePoint = template_points[point_index];
		// if (isBooleanTrue(this.pv.useCopyExpr)) {
		// 	this.stampNode().setPoint(templatePoint);
		// }

		const movedObjects = await this._getMovedObjectsForTemplatePoint(instanceCoreGroup, point_index);

		for (let movedObject of movedObjects) {
			// this._applyMatrixToObject(movedObject, this._instanceMatrix);
			csgApplyMatrix4(movedObject, this._instanceMatrix);
			this._applyAccumulatedTransform(movedObject);

			this._objects.push(movedObject);
		}
	}
	private async _getMovedObjectsForTemplatePoint(
		instanceCoreGroup: CsgCoreGroup,
		pointIndex: number
	): Promise<CsgObject[]> {
		const stampedInstanceCoreGroup = await this._stampInstanceGroupIfRequired(instanceCoreGroup);
		if (stampedInstanceCoreGroup) {
			return stampedInstanceCoreGroup.clone().objects();
		} else {
			return [];
		}
	}

	private async _stampInstanceGroupIfRequired(instance_core_group: CsgCoreGroup): Promise<CsgCoreGroup | undefined> {
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
			const core_group0 = container0.coreContent();
			if (core_group0) {
				return core_group0;
			} else {
				return;
			}
		} else {
			this.states.error.set(`input failed for index ${this.stampValue()}`);
			return;
		}
		// } else {
		// 	return instance_core_group;
		// }
	}

	private async _copyMovedObjectsForEachInstance(instance_core_group: CsgCoreGroup) {
		this._initAccumulatedTransform();
		for (let i = 0; i < this.pv.count; i++) {
			await this._copyMovedObjectsForInstance(instance_core_group, i);
			this._accumulateTransform();
		}
	}

	private async _copyMovedObjectsForInstance(instance_core_group: CsgCoreGroup, i: number) {
		if (isBooleanTrue(this.pv.useCopyExpr)) {
			this.stampNode().setGlobalIndex(i);
		}

		const stamped_instance_core_group = await this._stampInstanceGroupIfRequired(instance_core_group);
		if (stamped_instance_core_group) {
			stamped_instance_core_group.objects().forEach((object) => {
				// TODO: I should use the Core Group, to ensure that material.linewidth is properly cloned
				const clonedObject = CsgCoreObject.clone(object);
				this._applyAccumulatedTransform(clonedObject);
				this._objects.push(clonedObject);
			});
		}
	}

	// TODO: what if I combine both param_count and stamping?!
	private async cookWithoutTemplate(instance_core_group: CsgCoreGroup) {
		this._objects = [];
		await this._copyMovedObjectsForEachInstance(instance_core_group);

		this.setCsgCoreObjects(this._objects);
	}

	//
	//
	// STAMP
	//
	//
	stampValue(attrib_name?: string) {
		return this.stampNode().value(attrib_name);
	}
	stampNode() {
		return (this._stampNode = this._stampNode || this._createStampNode());
	}
	private _createStampNode() {
		const stampNode = new CsgCopyStamp(this.scene());
		this.dirtyController.setForbiddenTriggerNodes([stampNode]);
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
	private _applyAccumulatedTransform(object: CsgObject) {
		csgApplyMatrix4(object, this._transformAccumulatedMatrix);
	}

	//
	//
	// MATRIX OPERATIONS
	//
	//
	// private _applyMatrixToObjectOrGeometry(object: Object3D, matrix: Matrix4) {
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
	// private _applyMatrixToObject(object: Object3D, matrix: Matrix4) {
	// 	object.matrix.multiply(matrix);
	// 	object.matrix.decompose(object.position, object.quaternion, object.scale);
	// 	// center to origin
	// 	// this._object_position.copy(object.position);
	// 	// object.position.multiplyScalar(0);
	// 	// object.updateMatrix();
	// 	// // apply matrix
	// 	// object.applyMatrix4(matrix);
	// 	// // revert to position
	// 	// object.position.add(this._object_position);
	// 	// object.updateMatrix();
	// }
}
