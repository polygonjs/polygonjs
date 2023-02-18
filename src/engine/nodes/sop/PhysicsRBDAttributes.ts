/**
 * Creates object attributes used to create a physics object.

 *
 */
import {StringParam} from './../../params/String';
import {TypeAssert} from './../../poly/Assert';
import {FloatParam} from './../../params/Float';
import {IntegerParam} from './../../params/Integer';
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
import {
	PhysicsRBDAttributesSopOperation,
	SIZE_COMPUTATION_METHOD_MENU_ENTRIES,
	SizeComputationMethod,
	SIZE_COMPUTATION_METHODS,
} from '../../operations/sop/PhysicsRBDAttributes';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreObject} from '../../../core/geometry/Object';
import {Object3D, Vector3} from 'three';
import {Vector3Param} from '../../params/Vector3';
import {isBooleanTrue} from '../../../core/Type';
import {BooleanParam} from '../../params/Boolean';
import {SopType} from '../../poly/registers/nodes/types/Sop';
const DEFAULT = PhysicsRBDAttributesSopOperation.DEFAULT_PARAMS;

type Vector3Component = 'x' | 'y' | 'z';
const VECTOR3_COMPONENT_NAMES: Array<Vector3Component> = ['x', 'y', 'z'];
const tmpV3 = new Vector3();

const SIZE_METHOD_CUSTOM = {sizeMethod: SIZE_COMPUTATION_METHODS.indexOf(SizeComputationMethod.MANUAL)};
const VISIBLE_OPTIONS = {
	CAPSULE: {
		...SIZE_METHOD_CUSTOM,
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CAPSULE),
	},
	CONE: {
		...SIZE_METHOD_CUSTOM,
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CONE),
	},
	CUBOID: {
		...SIZE_METHOD_CUSTOM,
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CUBOID),
	},
	CYLINDER: {
		...SIZE_METHOD_CUSTOM,
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.CYLINDER),
	},
	SPHERE: {
		...SIZE_METHOD_CUSTOM,
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.SPHERE),
	},
	HEIGHT_FIELD: {
		colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(PhysicsRBDColliderType.HEIGHT_FIELD),
	},
};
const SIZE_METHOD_AVAILABLE: PhysicsRBDColliderType[] = [
	PhysicsRBDColliderType.CAPSULE,
	PhysicsRBDColliderType.CONE,
	PhysicsRBDColliderType.CUBOID,
	PhysicsRBDColliderType.CYLINDER,
	PhysicsRBDColliderType.SPHERE,
];
export const BORDER_RADIUS_AVAILABLE: PhysicsRBDColliderType[] = [
	PhysicsRBDColliderType.CONE,
	PhysicsRBDColliderType.CUBOID,
	PhysicsRBDColliderType.CYLINDER,
];
class PhysicsRBDAttributesSopParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param Rigid body type */
	RBDType = ParamConfig.INTEGER(DEFAULT.RBDType, {
		menu: {
			entries: PHYSICS_RBD_TYPE_MENU_ENTRIES,
		},
	});
	/** @param collider type */
	colliderType = ParamConfig.INTEGER(DEFAULT.colliderType, {
		menu: {
			entries: PHYSICS_RBD_COLLIDER_TYPE_MENU_ENTRIES,
		},
	});
	/** @param Rigid body type */
	sizeMethod = ParamConfig.INTEGER(DEFAULT.sizeMethod, {
		visibleIf: SIZE_METHOD_AVAILABLE.map((colliderType) => ({
			colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(colliderType),
		})),
		menu: {
			entries: SIZE_COMPUTATION_METHOD_MENU_ENTRIES,
		},
	});
	/** @param border radius */
	borderRadius = ParamConfig.FLOAT(DEFAULT.borderRadius, {
		visibleIf: BORDER_RADIUS_AVAILABLE.map((colliderType) => ({
			colliderType: PHYSICS_RBD_COLLIDER_TYPES.indexOf(colliderType),
		})),
		expression: {forEntities: true},
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
	/** @param heightField rows */
	rows = ParamConfig.INTEGER(DEFAULT.rows, {
		range: [1, 100],
		rangeLocked: [true, false],
		visibleIf: VISIBLE_OPTIONS.HEIGHT_FIELD,
		expression: {forEntities: true},
	});
	/** @param heightField cols */
	cols = ParamConfig.INTEGER(DEFAULT.cols, {
		range: [1, 100],
		rangeLocked: [true, false],
		visibleIf: VISIBLE_OPTIONS.HEIGHT_FIELD,
		expression: {forEntities: true},
	});
	/** @param density */
	density = ParamConfig.FLOAT(DEFAULT.density, {
		range: [0, 10],
		rangeLocked: [true, false],
		expression: {forEntities: true},
		separatorBefore: true,
	});
	/** @param friction */
	friction = ParamConfig.FLOAT(DEFAULT.friction, {
		range: [0, 1],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param restitution */
	restitution = ParamConfig.FLOAT(DEFAULT.restitution, {
		range: [0, 2],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param linear damping (affects velocity) */
	linearDamping = ParamConfig.FLOAT(DEFAULT.linearDamping, {
		range: [0, 10],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param angular damping (affects rotations) */
	angularDamping = ParamConfig.FLOAT(DEFAULT.angularDamping, {
		range: [0, 10],
		rangeLocked: [true, false],
		expression: {forEntities: true},
	});
	/** @param linear velocity */
	linearVelocity = ParamConfig.VECTOR3(DEFAULT.linearVelocity, {
		expression: {forEntities: true},
	});
	/** @param angular velocity */
	angularVelocity = ParamConfig.VECTOR3(DEFAULT.angularVelocity, {
		expression: {forEntities: true},
	});
	/** @param gravity Scale */
	gravityScale = ParamConfig.FLOAT(DEFAULT.gravityScale, {
		range: [-10, 10],
		rangeLocked: [false, false],
		expression: {forEntities: true},
	});
	/** @param can sleep */
	canSleep = ParamConfig.BOOLEAN(DEFAULT.canSleep, {
		expression: {forEntities: true},
	});
	details = ParamConfig.FOLDER();
	/** @param add id */
	addId = ParamConfig.BOOLEAN(1);
	/** @param id */
	id = ParamConfig.STRING('`$OS`-`@objnum`', {
		visibleIf: {addId: true},
		expression: {forEntities: true},
	});
}
const ParamsConfig = new PhysicsRBDAttributesSopParamsConfig();

export class PhysicsRBDAttributesSopNode extends TypedSopNode<PhysicsRBDAttributesSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PHYSICS_RBD_ATTRIBUTES;
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
	setSizeMethod(sizeMethod: SizeComputationMethod) {
		this.p.sizeMethod.set(SIZE_COMPUTATION_METHODS.indexOf(sizeMethod));
	}
	sizeMethod() {
		return SIZE_COMPUTATION_METHODS[this.pv.sizeMethod];
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const RBDType = this.RBDType();
		const colliderType = this.colliderType();
		const sizeMethod = this.sizeMethod();
		const coreObjects = coreGroup.coreObjects();
		for (let coreObject of coreObjects) {
			const object = coreObject.object();
			CorePhysicsAttribute.setRBDType(object, RBDType);

			CorePhysicsAttribute.setColliderType(object, colliderType);
		}
		const promises: Array<Promise<void>> = [];
		this._applyColliderType(colliderType, sizeMethod, coreObjects, promises);

		if (BORDER_RADIUS_AVAILABLE.includes(colliderType)) {
			promises.push(
				this._computeNumberParam(
					this.p.borderRadius,
					coreObjects,
					CorePhysicsAttribute.setBorderRadius.bind(CorePhysicsAttribute)
				)
			);
		}

		promises.push(
			this._computeNumberParam(
				this.p.density,
				coreObjects,
				CorePhysicsAttribute.setDensity.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeNumberParam(
				this.p.friction,
				coreObjects,
				CorePhysicsAttribute.setFriction.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeNumberParam(
				this.p.linearDamping,
				coreObjects,
				CorePhysicsAttribute.setLinearDamping.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeNumberParam(
				this.p.angularDamping,
				coreObjects,
				CorePhysicsAttribute.setAngularDamping.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeVector3Param(
				this.p.linearVelocity,
				coreObjects,
				CorePhysicsAttribute.setLinearVelocity.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeVector3Param(
				this.p.angularVelocity,
				coreObjects,
				CorePhysicsAttribute.setAngularVelocity.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeNumberParam(
				this.p.gravityScale,
				coreObjects,
				CorePhysicsAttribute.setGravityScale.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeNumberParam(
				this.p.restitution,
				coreObjects,
				CorePhysicsAttribute.setRestitution.bind(CorePhysicsAttribute)
			)
		);
		promises.push(
			this._computeBooleanParam(
				this.p.canSleep,
				coreObjects,
				CorePhysicsAttribute.setCanSleep.bind(CorePhysicsAttribute)
			)
		);

		if (isBooleanTrue(this.pv.addId)) {
			promises.push(
				this._computeStringParam(
					this.p.id,
					coreObjects,
					CorePhysicsAttribute.setRBDId.bind(CorePhysicsAttribute)
				)
			);
		}
		await Promise.all(promises);

		// this._operation = this._operation || new PhysicsRBDAttributesSopOperation(this._scene, this.states);
		// const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(coreGroup);
	}
	protected _applyColliderType(
		colliderType: PhysicsRBDColliderType,
		sizeMethod: SizeComputationMethod,
		coreObjects: CoreObject[],
		promises: Array<Promise<void>>
	) {
		switch (colliderType) {
			case PhysicsRBDColliderType.CUBOID: {
				switch (sizeMethod) {
					case SizeComputationMethod.AUTO: {
						for (let coreObject of coreObjects) {
							const geometry = coreObject.geometry();
							if (geometry) {
								geometry.computeBoundingBox();
								if (geometry.boundingBox != null) {
									geometry.boundingBox.getSize(tmpV3);
									CorePhysicsAttribute.setCuboidSizes(coreObject.object(), tmpV3);
									CorePhysicsAttribute.setCuboidSize(coreObject.object(), 1);
								}
							}
						}
						return;
					}
					case SizeComputationMethod.MANUAL: {
						promises.push(
							this._computeVector3Param(
								this.p.sizes,
								coreObjects,
								CorePhysicsAttribute.setCuboidSizes.bind(CorePhysicsAttribute)
							)
						);
						promises.push(
							this._computeNumberParam(
								this.p.size,
								coreObjects,
								CorePhysicsAttribute.setCuboidSize.bind(CorePhysicsAttribute)
							)
						);
						return;
					}
				}

				return;
			}
			case PhysicsRBDColliderType.SPHERE: {
				switch (sizeMethod) {
					case SizeComputationMethod.AUTO: {
						for (let coreObject of coreObjects) {
							const geometry = coreObject.geometry();
							if (geometry) {
								geometry.computeBoundingSphere();
								const radius = geometry.boundingSphere?.radius;
								if (radius != null) {
									CorePhysicsAttribute.setRadius(coreObject.object(), radius);
								}
							}
						}
						return;
					}
					case SizeComputationMethod.MANUAL: {
						promises.push(
							this._computeNumberParam(
								this.p.radius,
								coreObjects,
								CorePhysicsAttribute.setRadius.bind(CorePhysicsAttribute)
							)
						);
						return;
					}
				}

				return;
			}
			case PhysicsRBDColliderType.CAPSULE: {
				switch (sizeMethod) {
					case SizeComputationMethod.AUTO: {
						for (let coreObject of coreObjects) {
							const geometry = coreObject.geometry();
							if (geometry) {
								geometry.computeBoundingBox();
								if (geometry.boundingBox != null) {
									geometry.boundingBox.getSize(tmpV3);
									const radius = 0.5 * tmpV3.x;
									const height = tmpV3.y - 2 * radius;
									CorePhysicsAttribute.setHeight(coreObject.object(), height);
									CorePhysicsAttribute.setRadius(coreObject.object(), radius);
								}
							}
						}
						return;
					}
					case SizeComputationMethod.MANUAL: {
						promises.push(
							this._computeNumberParam(
								this.p.height,
								coreObjects,
								CorePhysicsAttribute.setHeight.bind(CorePhysicsAttribute)
							)
						);
						promises.push(
							this._computeNumberParam(
								this.p.radius,
								coreObjects,
								CorePhysicsAttribute.setRadius.bind(CorePhysicsAttribute)
							)
						);
						return;
					}
				}

				return;
			}
			case PhysicsRBDColliderType.CONE:
			case PhysicsRBDColliderType.CYLINDER: {
				switch (sizeMethod) {
					case SizeComputationMethod.AUTO: {
						for (let coreObject of coreObjects) {
							const geometry = coreObject.geometry();
							if (geometry) {
								geometry.computeBoundingBox();
								if (geometry.boundingBox != null) {
									geometry.boundingBox.getSize(tmpV3);
									CorePhysicsAttribute.setHeight(coreObject.object(), tmpV3.y);
									CorePhysicsAttribute.setRadius(coreObject.object(), 0.5 * tmpV3.x);
								}
							}
						}
						return;
					}
					case SizeComputationMethod.MANUAL: {
						promises.push(
							this._computeNumberParam(
								this.p.height,
								coreObjects,
								CorePhysicsAttribute.setHeight.bind(CorePhysicsAttribute)
							)
						);
						promises.push(
							this._computeNumberParam(
								this.p.radius,
								coreObjects,
								CorePhysicsAttribute.setRadius.bind(CorePhysicsAttribute)
							)
						);
						return;
					}
				}

				return;
			}
			case PhysicsRBDColliderType.HEIGHT_FIELD: {
				promises.push(
					this._computeNumberParam(
						this.p.rows,
						coreObjects,
						CorePhysicsAttribute.setHeightFieldRows.bind(CorePhysicsAttribute)
					)
				);
				promises.push(
					this._computeNumberParam(
						this.p.cols,
						coreObjects,
						CorePhysicsAttribute.setHeightFieldCols.bind(CorePhysicsAttribute)
					)
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
	protected async _computeNumberParam(
		param: FloatParam | IntegerParam,
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
