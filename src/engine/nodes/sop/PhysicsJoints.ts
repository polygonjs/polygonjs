import {CorePhysicsJoinAttribute, PhysicsJointType} from './../../../core/physics/PhysicsJoint';
/**
 * Creates joints data from objects with RBD attributes

 *
 */
import {CorePhysicsAttribute} from './../../../core/physics/PhysicsAttribute';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D, Vector3, Group} from 'three';

const center = new Vector3();
const delta = new Vector3();

class PhysicsJointsSopParamsConfig extends NodeParamsConfig {
	/** @param maxDistance */
	maxDistance = ParamConfig.FLOAT(1);
}
const ParamsConfig = new PhysicsJointsSopParamsConfig();

export class PhysicsJointsSopNode extends TypedSopNode<PhysicsJointsSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsJoints';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to create bounding box from (optional)'];
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const inputObjects = coreGroup.objects();
		const candidateObjects = inputObjects.filter((object) => CorePhysicsAttribute.getRBDId(object) != null);

		const joinObjects: Object3D[] = [];
		const {maxDistance} = this.pv;
		const pairChecked: Set<string> = new Set();
		for (let i1 = 0; i1 < candidateObjects.length; i1++) {
			const object1 = candidateObjects[i1];
			for (let i2 = 0; i2 < candidateObjects.length; i2++) {
				const object2 = candidateObjects[i2];
				if (i1 != i2) {
					if (object1.position.distanceTo(object2.position) < maxDistance) {
						const is = [i1, i2].sort((a, b) => a - b).join('-');
						if (!pairChecked.has(is)) {
							pairChecked.add(is);
							const jointObject = this._createJoint(object1, object2);
							joinObjects.push(jointObject);
						}
					}
				}
			}
		}
		const allObjects = [...inputObjects, ...joinObjects];
		this.setObjects(allObjects);
	}
	private _createJoint(object1: Object3D, object2: Object3D) {
		const group = new Group();
		group.matrixAutoUpdate = false;
		CorePhysicsJoinAttribute.setRBDId1(group, CorePhysicsAttribute.getRBDId(object1));
		CorePhysicsJoinAttribute.setRBDId2(group, CorePhysicsAttribute.getRBDId(object2));

		center.copy(object1.position).add(object2.position).multiplyScalar(0.5);
		delta.copy(center).sub(object1.position);
		CorePhysicsJoinAttribute.setAnchor1(group, delta);
		delta.copy(center).sub(object2.position);
		CorePhysicsJoinAttribute.setAnchor2(group, delta);

		CorePhysicsJoinAttribute.setJoinType(group, PhysicsJointType.SPHERICAL);

		return group;
	}
}
