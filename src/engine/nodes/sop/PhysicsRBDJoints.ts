/**
 * Creates joints data from objects with RBD attributes

 *
 */
import {
	CorePhysicsJoinAttribute,
	PhysicsJointType,
	PHYSICS_JOINT_TYPE_MENU_ENTRIES,
	PHYSICS_JOINT_TYPES,
} from '../../../core/physics/PhysicsJoint';
import {CorePhysicsAttribute} from '../../../core/physics/PhysicsAttribute';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {addToSetAtEntry, mapIncrementAtEntry} from '../../../core/MapUtils';
import {isBooleanTrue} from '../../../core/Type';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D, Vector4, Vector3, Group, Box3, Matrix4, Quaternion} from 'three';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const center = new Vector3();
// const delta = new Vector3();
const tmpV3_1 = new Vector3();
const tmpV3_2 = new Vector3();
const tmpQuat = new Quaternion();
const frame1 = new Vector4();
const frame2 = new Vector4();
const axis = new Vector3();
const bbox = new Box3();
const _mat = new Matrix4();

function quaternionToVector4(quaternion: Quaternion, target: Vector4) {
	target.x = quaternion.x;
	target.y = quaternion.y;
	target.z = quaternion.z;
	target.w = quaternion.w;
}
const checkedPair: Map<number, Set<number>> = new Map();
const jointsCountByKey: Map<number, number> = new Map();

class PhysicsRBDJointsSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('', {
		objectMask: true,
	});
	/** @param maxDistance */
	maxDistance = ParamConfig.FLOAT(1, {
		range: [0, 10],
	});
	/** @param max number of joints per object */
	maxJointsCount = ParamConfig.INTEGER(2, {
		range: [0, 10],
	});
	/** @param joint type */
	jointType = ParamConfig.INTEGER(PHYSICS_JOINT_TYPES.indexOf(PhysicsJointType.SPHERICAL), {
		menu: {
			entries: PHYSICS_JOINT_TYPE_MENU_ENTRIES,
		},
	});

	/** @param limit */
	limit = ParamConfig.VECTOR2([-1, 1], {
		separatorBefore: true,
		visibleIf: [
			{
				jointType: PHYSICS_JOINT_TYPES.indexOf(PhysicsJointType.REVOLUT),
			},
			{
				jointType: PHYSICS_JOINT_TYPES.indexOf(PhysicsJointType.PRISMATIC),
			},
		],
	});
	/** @param up */
	up = ParamConfig.VECTOR3([0, 1, 0], {
		visibleIf: [
			{
				jointType: PHYSICS_JOINT_TYPES.indexOf(PhysicsJointType.REVOLUT),
			},
		],
	});
	/** @param center */
	center = ParamConfig.FLOAT(0.5, {
		separatorBefore: true,
		visibleIf: [
			{
				jointType: PHYSICS_JOINT_TYPES.indexOf(PhysicsJointType.SPHERICAL),
			},
			{
				jointType: PHYSICS_JOINT_TYPES.indexOf(PhysicsJointType.REVOLUT),
			},
		],
	});
	/** @param anchors at objects center */
	anchorsAtCenter = ParamConfig.BOOLEAN(1, {});
	/** @param anchor position 1 */
	anchorsPos1 = ParamConfig.VECTOR3([0.5, 0.5, 0.5], {
		visibleIf: {anchorsAtCenter: 0},
	});
	/** @param anchor position 2 */
	anchorsPos2 = ParamConfig.VECTOR3([0.5, 0.5, 0.5], {
		visibleIf: {anchorsAtCenter: 0},
	});
	/** @param do not output input RBDs with joints */
	ouputsJointsOnly = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
}
const ParamsConfig = new PhysicsRBDJointsSopParamsConfig();

export class PhysicsRBDJointsSopNode extends TypedSopNode<PhysicsRBDJointsSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PHYSICS_RBD_JOINTS;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	setJointType(RBDtype: PhysicsJointType) {
		this.p.jointType.set(PHYSICS_JOINT_TYPES.indexOf(RBDtype));
	}
	jointType() {
		return PHYSICS_JOINT_TYPES[this.pv.jointType];
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const inputObjects = coreGroup.allObjects();
		const selectedObjects = CoreMask.filterThreejsObjects(coreGroup, this.pv);
		const candidateObjects = selectedObjects.filter((object) => CorePhysicsAttribute.getRBDId(object) != null);

		const joinObjects: Object3D[] = [];
		const maxDistance = this.pv.maxDistance;
		const maxJointsCount = this.pv.maxJointsCount;
		checkedPair.clear();
		jointsCountByKey.clear();
		let maxJointsCountReached = false;
		let maxJointsCountReached1 = false;
		let maxJointsCountReached2 = false;
		let jointsCount1: number | undefined;
		let jointsCount2: number | undefined;
		let jointIndex = 0;
		let existingSet: Set<number> | undefined;
		for (let i1 = 0; i1 < candidateObjects.length; i1++) {
			const object1 = candidateObjects[i1];
			for (let i2 = 0; i2 < candidateObjects.length; i2++) {
				const object2 = candidateObjects[i2];
				if (i1 != i2) {
					jointsCount1 = jointsCountByKey.get(i1);
					jointsCount2 = jointsCountByKey.get(i2);
					maxJointsCountReached1 = jointsCount1 != null && jointsCount1 >= maxJointsCount;
					maxJointsCountReached2 = jointsCount2 != null && jointsCount2 >= maxJointsCount;
					maxJointsCountReached = maxJointsCountReached1 || maxJointsCountReached2;
					if (!maxJointsCountReached) {
						if (object1.position.distanceTo(object2.position) < maxDistance) {
							let key = i1 < i2 ? i1 : i2;
							let idInSet = i1 < i2 ? i2 : i1;
							existingSet = checkedPair.get(key);
							if (existingSet == null || !existingSet.has(idInSet)) {
								addToSetAtEntry(checkedPair, key, idInSet);
								const jointObject = this._createJoint(object1, object2);
								jointObject.name = `${this.name()}_${jointIndex}`;
								jointIndex++;
								joinObjects.push(jointObject);
								mapIncrementAtEntry(jointsCountByKey, i1, 0);
								mapIncrementAtEntry(jointsCountByKey, i2, 0);
							}
						}
					}
				}
			}
		}
		const allObjects = isBooleanTrue(this.pv.ouputsJointsOnly) ? joinObjects : [...inputObjects, ...joinObjects];
		this.setObjects(allObjects);
	}
	private _createJoint(object1: Object3D, object2: Object3D) {
		const group = new Group();
		group.matrixAutoUpdate = false;
		CorePhysicsJoinAttribute.setRBDId1(group, CorePhysicsAttribute.getRBDId(object1));
		CorePhysicsJoinAttribute.setRBDId2(group, CorePhysicsAttribute.getRBDId(object2));

		const getAnchorPos = (object: Object3D, paramValue: Vector3, target: Vector3) => {
			object.updateMatrix();

			if (isBooleanTrue(this.pv.anchorsAtCenter)) {
				target.set(0, 0, 0);
				target.applyMatrix4(object.matrix);
			} else {
				_mat.copy(object.matrix);
				object.matrix.identity();
				bbox.setFromObject(object);
				target.x = paramValue.x * bbox.max.x + (1 - paramValue.x) * bbox.min.x;
				target.y = paramValue.y * bbox.max.y + (1 - paramValue.y) * bbox.min.y;
				target.z = paramValue.z * bbox.max.z + (1 - paramValue.z) * bbox.min.z;
				object.matrix.copy(_mat);
				target.applyMatrix4(object.matrix);
			}
		};

		getAnchorPos(object1, this.pv.anchorsPos1, tmpV3_1);
		getAnchorPos(object2, this.pv.anchorsPos2, tmpV3_2);
		center.copy(tmpV3_1).lerp(tmpV3_2, this.pv.center);
		axis.copy(tmpV3_2).sub(tmpV3_1).normalize();

		const makeLocal = (object: Object3D, target: Vector3) => {
			_mat.copy(object.matrix).invert();
			target.copy(center);
			target.applyMatrix4(_mat);
		};
		makeLocal(object1, tmpV3_1);
		makeLocal(object2, tmpV3_2);
		CorePhysicsJoinAttribute.setAnchor1(group, tmpV3_1);
		CorePhysicsJoinAttribute.setAnchor2(group, tmpV3_2);

		const jointType = this.jointType();
		CorePhysicsJoinAttribute.setJoinType(group, jointType);
		switch (jointType) {
			case PhysicsJointType.FIXED: {
				tmpQuat.copy(object1.quaternion);
				tmpQuat.slerp(object2.quaternion, 0.5);
				tmpQuat.invert();
				quaternionToVector4(tmpQuat, frame1);
				tmpQuat.copy(object2.quaternion);
				tmpQuat.slerp(object1.quaternion, 0.5);
				tmpQuat.invert();
				quaternionToVector4(tmpQuat, frame2);
				CorePhysicsJoinAttribute.setFrame1(group, frame1);
				CorePhysicsJoinAttribute.setFrame2(group, frame2);
				break;
			}
			case PhysicsJointType.PRISMATIC: {
				CorePhysicsJoinAttribute.setLimit(group, this.pv.limit);
				// axis.transformDirection(object2.matrix);
				CorePhysicsJoinAttribute.setAxis(group, axis);
				break;
			}
			case PhysicsJointType.REVOLUT: {
				CorePhysicsJoinAttribute.setLimit(group, this.pv.limit);
				axis.cross(this.pv.up).normalize();
				// axis.transformDirection(object2.matrix);
				CorePhysicsJoinAttribute.setAxis(group, axis);
				break;
			}
		}

		return group;
	}
}
