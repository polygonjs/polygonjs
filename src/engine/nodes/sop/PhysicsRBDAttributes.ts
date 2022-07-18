import {StringParam} from './../../params/String';
import {TypeAssert} from './../../poly/Assert';
import {FloatParam} from './../../params/Float';
import {CorePhysicsAttribute, PhysicsRBDColliderType, PhysicsRBDType} from './../../../core/physics/PhysicsAttribute';
/**
 * Creates object attributes used to create a physics object.

 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PhysicsRBDAttributesSopOperation} from '../../operations/sop/PhysicsRBDAttributes';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PHYSICS_RBD_COLLIDER_TYPES, PHYSICS_RBD_TYPES} from '../../../core/physics/PhysicsAttribute';
import {CoreObject} from '../../../core/geometry/Object';
import {Object3D, Vector3} from 'three';
import {Vector3Param} from '../../params/Vector3';
import {isBooleanTrue} from '../../../core/Type';
const DEFAULT = PhysicsRBDAttributesSopOperation.DEFAULT_PARAMS;
class PhysicsRBDAttributesSopParamsConfig extends NodeParamsConfig {
	/** @param Rigid body type */
	type = ParamConfig.STRING(DEFAULT.type, {
		menuString: {
			entries: PHYSICS_RBD_TYPES.map((name, value) => ({name, value: name})),
		},
	});
	/** @param collider type */
	colliderType = ParamConfig.STRING(DEFAULT.colliderType, {
		menuString: {
			entries: PHYSICS_RBD_COLLIDER_TYPES.map((name, value) => ({name, value: name})),
		},
	});
	/** @param add id */
	taddId = ParamConfig.BOOLEAN(1);
	/** @param id */
	id = ParamConfig.STRING('`$OS`-`@objnum`', {
		visibleIf: {taddId: true},
		expression: {forEntities: true},
	});

	/** @param size */
	size = ParamConfig.VECTOR3(DEFAULT.size.toArray(), {
		visibleIf: {
			colliderType: PhysicsRBDColliderType.CUBOID,
		},
		expression: {forEntities: true},
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: [
			{
				colliderType: PhysicsRBDColliderType.SPHERE,
			},
			{
				colliderType: PhysicsRBDColliderType.CAPSULE,
			},
		],
		expression: {forEntities: true},
	});
	/** @param half height */
	halfHeight = ParamConfig.FLOAT(DEFAULT.halfHeight, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: {
			colliderType: PhysicsRBDColliderType.CAPSULE,
		},
		expression: {forEntities: true},
	});
	/** @param restitution */
	restitution = ParamConfig.FLOAT(DEFAULT.restitution, {
		range: [0, 1],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param linear damping (affects velocity) */
	linearDamping = ParamConfig.FLOAT(DEFAULT.linearDamping, {
		range: [0, 1],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param angular damping (affects rotations) */
	angularDamping = ParamConfig.FLOAT(DEFAULT.angularDamping, {
		range: [0, 1],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
}
const ParamsConfig = new PhysicsRBDAttributesSopParamsConfig();

export class PhysicsRBDAttributesSopNode extends TypedSopNode<PhysicsRBDAttributesSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsRBDAttributes';
	}

	static override displayedInputNames(): string[] {
		return ['objects to add physics RBD attributes to'];
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(PhysicsRBDAttributesSopOperation.INPUT_CLONED_STATE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const colliderType = this.pv.colliderType as PhysicsRBDColliderType;
		const coreObjects = coreGroup.coreObjects();
		for (let coreObject of coreObjects) {
			const object = coreObject.object();
			CorePhysicsAttribute.setRBDType(object, this.pv.type as PhysicsRBDType);

			CorePhysicsAttribute.setColliderType(object, colliderType);
		}

		this._computeFloatParam(
			this.p.linearDamping,
			coreObjects,
			CorePhysicsAttribute.setLinearDamping.bind(CorePhysicsAttribute)
		);
		this._computeFloatParam(
			this.p.angularDamping,
			coreObjects,
			CorePhysicsAttribute.setAngularDamping.bind(CorePhysicsAttribute)
		);
		this._computeFloatParam(
			this.p.restitution,
			coreObjects,
			CorePhysicsAttribute.setRestitution.bind(CorePhysicsAttribute)
		);

		this._applyColliderType(colliderType, coreObjects);
		if (isBooleanTrue(this.pv.taddId)) {
			this._computeStringParam(this.p.id, coreObjects, CorePhysicsAttribute.setRBDId.bind(CorePhysicsAttribute));
		}

		// this._operation = this._operation || new PhysicsRBDAttributesSopOperation(this._scene, this.states);
		// const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(coreGroup);
	}
	protected _applyColliderType(colliderType: PhysicsRBDColliderType, coreObjects: CoreObject[]) {
		switch (colliderType) {
			case PhysicsRBDColliderType.CUBOID: {
				this._computeVector3Param(
					this.p.size,
					coreObjects,
					CorePhysicsAttribute.setCuboidSize.bind(CorePhysicsAttribute)
				);
				return;
			}
			case PhysicsRBDColliderType.SPHERE: {
				this._computeFloatParam(
					this.p.radius,
					coreObjects,
					CorePhysicsAttribute.setRadius.bind(CorePhysicsAttribute)
				);
				return;
			}
			case PhysicsRBDColliderType.CAPSULE: {
				this._computeFloatParam(
					this.p.halfHeight,
					coreObjects,
					CorePhysicsAttribute.setHalfHeight.bind(CorePhysicsAttribute)
				);
				this._computeFloatParam(
					this.p.radius,
					coreObjects,
					CorePhysicsAttribute.setRadius.bind(CorePhysicsAttribute)
				);
				return;
			}
		}
		TypeAssert.unreachable(colliderType);
	}

	protected async _computeStringParam(
		param: StringParam,
		coreObjects: CoreObject[],
		applyMethod: (object: Object3D, value: string) => void
	) {
		if (param.expressionController) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value: string) => {
				applyMethod(coreObject.object(), value);
			});
		} else {
			for (let coreObject of coreObjects) {
				applyMethod(coreObject.object(), param.value);
			}
		}
	}
	protected async _computeVector3Param(
		param: Vector3Param,
		coreObjects: CoreObject[],
		applyMethod: (object: Object3D, value: Vector3) => void
	) {
		if (param.expressionController) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
				applyMethod(coreObject.object(), value);
			});
		} else {
			for (let coreObject of coreObjects) {
				applyMethod(coreObject.object(), param.value);
			}
		}
	}
	protected async _computeFloatParam(
		param: FloatParam,
		coreObjects: CoreObject[],
		applyMethod: (object: Object3D, value: number) => void
	) {
		if (param.expressionController) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
				applyMethod(coreObject.object(), value);
			});
		} else {
			for (let coreObject of coreObjects) {
				applyMethod(coreObject.object(), param.value);
			}
		}
	}
}
