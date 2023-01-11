/**
 * Creates object attributes used to create a physics object.

 *
 */
import {StringParam} from './../../params/String';
import {TypeAssert} from './../../poly/Assert';
import {FloatParam} from './../../params/Float';
import {
	PHYSICS_RBD_COLLIDER_TYPES,
	PHYSICS_RBD_TYPES,
	CorePhysicsAttribute,
	PhysicsRBDColliderType,
	PHYSICS_RBD_TYPE_MENU_ENTRIES,
	PHYSICS_RBD_COLLIDER_TYPE_MENU_ENTRIES,
	PhysicsRBDType,
} from './../../../core/physics/PhysicsAttribute';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {PhysicsRBDAttributesSopOperation} from '../../operations/sop/PhysicsRBDAttributes';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreObject} from '../../../core/geometry/Object';
import {Object3D, Vector3} from 'three';
import {Vector3Param} from '../../params/Vector3';
import {isBooleanTrue} from '../../../core/Type';
import {BooleanParam} from '../../params/Boolean';
const DEFAULT = PhysicsRBDAttributesSopOperation.DEFAULT_PARAMS;

type Vector3Component = 'x' | 'y' | 'z';
const VECTOR3_COMPONENT_NAMES: Array<Vector3Component> = ['x', 'y', 'z'];

const VISIBLE_OPTIONS = {
	CAPSULE: {
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CAPSULE),
	},
	CONE: {
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CONE),
	},
	CUBOID: {
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CUBOID),
	},
	CYLINDER: {
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CYLINDER),
	},
	SPHERE: {
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.SPHERE),
	},
};
class PhysicsRBDAttributesSopParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param Rigid body type */
	RBDType = ParamConfig.INTEGER(DEFAULT.RBDType, {
		menu: {
			entries: PHYSICS_RBD_TYPE_MENU_ENTRIES,
		},
	});
	/** @param add id */
	addId = ParamConfig.BOOLEAN(1);
	/** @param id */
	id = ParamConfig.STRING('`$OS`-`@objnum`', {
		visibleIf: {addId: true},
		expression: {forEntities: true},
	});
	shape = ParamConfig.FOLDER();
	/** @param collider type */
	colliderType = ParamConfig.INTEGER(DEFAULT.colliderType, {
		menu: {
			entries: PHYSICS_RBD_COLLIDER_TYPE_MENU_ENTRIES,
		},
	});

	/** @param sizes */
	sizes = ParamConfig.VECTOR3(DEFAULT.sizes.toArray(), {
		visibleIf: VISIBLE_OPTIONS.CUBOID,
		expression: {forEntities: true},
	});
	/** @param sizes */
	size = ParamConfig.FLOAT(DEFAULT.size, {
		visibleIf: VISIBLE_OPTIONS.CUBOID,
		expression: {forEntities: true},
	});
	/** @param radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: [VISIBLE_OPTIONS.CAPSULE, VISIBLE_OPTIONS.CONE, VISIBLE_OPTIONS.CYLINDER, VISIBLE_OPTIONS.SPHERE],
		expression: {forEntities: true},
	});
	/** @param half height */
	height = ParamConfig.FLOAT(DEFAULT.height, {
		range: [0, 1],
		rangeLocked: [true, false],
		visibleIf: [VISIBLE_OPTIONS.CAPSULE, VISIBLE_OPTIONS.CONE, VISIBLE_OPTIONS.CYLINDER],
		expression: {forEntities: true},
	});
	dynamics = ParamConfig.FOLDER();
	/** @param density */
	density = ParamConfig.FLOAT(DEFAULT.density, {
		range: [0, 1],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param friction */
	friction = ParamConfig.FLOAT(DEFAULT.friction, {
		range: [0, 1],
		rangeLocked: [true, false],
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
	/** @param can sleep */
	canSleep = ParamConfig.BOOLEAN(DEFAULT.canSleep, {
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

	setRBDType(RBDtype: PhysicsRBDType) {
		this.p.RBDType.set(PHYSICS_RBD_TYPES.indexOf(RBDtype));
	}
	RBDType() {
		return PHYSICS_RBD_TYPES[this.pv.RBDType];
	}
	setColliderType(colliderType: PhysicsRBDColliderType) {
		this.p.colliderType.set(PHYSICS_RBD_COLLIDER_TYPES.indexOf(colliderType));
	}
	colliderType() {
		return PHYSICS_RBD_COLLIDER_TYPES[this.pv.colliderType];
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const RBDType = this.RBDType();
		const colliderType = this.colliderType();
		const coreObjects = coreGroup.coreObjects();
		for (let coreObject of coreObjects) {
			const object = coreObject.object();
			CorePhysicsAttribute.setRBDType(object, RBDType);

			CorePhysicsAttribute.setColliderType(object, colliderType);
		}
		this._computeFloatParam(
			this.p.density,
			coreObjects,
			CorePhysicsAttribute.setDensity.bind(CorePhysicsAttribute)
		);
		this._computeFloatParam(
			this.p.friction,
			coreObjects,
			CorePhysicsAttribute.setFriction.bind(CorePhysicsAttribute)
		);
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
		this._computeBooleanParam(
			this.p.canSleep,
			coreObjects,
			CorePhysicsAttribute.setCanSleep.bind(CorePhysicsAttribute)
		);

		this._applyColliderType(colliderType, coreObjects);
		if (isBooleanTrue(this.pv.addId)) {
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
					this.p.sizes,
					coreObjects,
					CorePhysicsAttribute.setCuboidSizes.bind(CorePhysicsAttribute)
				);
				this._computeFloatParam(
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
			case PhysicsRBDColliderType.CAPSULE:
			case PhysicsRBDColliderType.CONE:
			case PhysicsRBDColliderType.CYLINDER: {
				this._computeFloatParam(
					this.p.height,
					coreObjects,
					CorePhysicsAttribute.setHeight.bind(CorePhysicsAttribute)
				);
				this._computeFloatParam(
					this.p.radius,
					coreObjects,
					CorePhysicsAttribute.setRadius.bind(CorePhysicsAttribute)
				);
				return;
			}
			case PhysicsRBDColliderType.CONVEX_HULL:
			case PhysicsRBDColliderType.TRIMESH: {
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
		if (param.expressionController && param.expressionController.entitiesDependent()) {
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
		vectorParam: Vector3Param,
		coreObjects: CoreObject[],
		applyMethod: (object: Object3D, value: Vector3) => void
	) {
		// if (param.expressionController && param.expressionController.entitiesDependent()) {
		// 	await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
		// 		applyMethod(coreObject.object(), value);
		// 	});
		// } else {
		// 	for (let coreObject of coreObjects) {
		// 		applyMethod(coreObject.object(), param.value);
		// 	}
		// }
		const components = vectorParam.components;
		const valuesByCoreObjectIndex: Map<number, Vector3> = new Map();
		// for (let component_param of components) {
		// values.push(component_param.value);
		// }
		// const initVector = this._vectorByAttribSize(this.pv.size);
		// if (initVector) {
		for (let coreObject of coreObjects) {
			valuesByCoreObjectIndex.set(coreObject.index(), new Vector3());
		}
		for (let componentIndex = 0; componentIndex < components.length; componentIndex++) {
			const component_param = components[componentIndex];
			const component_name = VECTOR3_COMPONENT_NAMES[componentIndex];
			if (
				component_param.hasExpression() &&
				component_param.expressionController &&
				component_param.expressionController.entitiesDependent()
			) {
				await component_param.expressionController.computeExpressionForObjects(
					coreObjects,
					(coreObject, value) => {
						const vector = valuesByCoreObjectIndex.get(coreObject.index());
						if (vector) {
							vector[component_name] = value;
						}
					}
				);
			} else {
				for (let coreObject of coreObjects) {
					const vector = valuesByCoreObjectIndex.get(coreObject.index());
					if (vector) {
						vector[component_name] = component_param.value;
					}
				}
			}
		}
		for (let i = 0; i < coreObjects.length; i++) {
			const coreObject = coreObjects[i];
			const value = valuesByCoreObjectIndex.get(coreObject.index());
			if (value != null) {
				// coreObject.setAttribValue(attribName, value);
				applyMethod(coreObject.object(), value);
			}
		}
		// }
	}
	protected async _computeFloatParam(
		param: FloatParam,
		coreObjects: CoreObject[],
		applyMethod: (object: Object3D, value: number) => void
	) {
		if (param.expressionController && param.expressionController.entitiesDependent()) {
			await param.expressionController.computeExpressionForObjects(coreObjects, (coreObject, value) => {
				applyMethod(coreObject.object(), value);
			});
		} else {
			for (let coreObject of coreObjects) {
				applyMethod(coreObject.object(), param.value);
			}
		}
	}
	protected async _computeBooleanParam(
		param: BooleanParam,
		coreObjects: CoreObject[],
		applyMethod: (object: Object3D, value: boolean) => void
	) {
		if (param.expressionController && param.expressionController.entitiesDependent()) {
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
