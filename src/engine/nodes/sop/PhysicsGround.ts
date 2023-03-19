/**
 * Create a physics ground
 *
 *
 */
import {CoreTransform} from './../../../core/Transform';
import {ObjectType} from './../../../core/geometry/Constant';
import {BoxGeometry, Vector3} from 'three';
import {CorePhysicsAttribute, PhysicsRBDColliderType, PhysicsRBDType} from './../../../core/physics/PhysicsAttribute';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseSopOperation} from '../../operations/sop/_Base';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT_UP = new Vector3(0, 1, 0);
const tmp = new Vector3(0, 0, 0);

class PhysicsGroundSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.VECTOR2([10, 10]);
	/** @param center */
	center = ParamConfig.VECTOR2([0, 0]);
	/** @param height */
	height = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param direction */
	direction = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param thickness */
	thickness = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param friction */
	friction = ParamConfig.FLOAT(0.5, {
		separatorBefore: true,
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param restitution */
	restitution = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new PhysicsGroundSopParamsConfig();

export class PhysicsGroundSopNode extends TypedSopNode<PhysicsGroundSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return SopType.PHYSICS_GROUND;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override cook() {
		const thickness = this.pv.thickness;
		const object = BaseSopOperation.createObject(
			new BoxGeometry(this.pv.size.x, thickness, this.pv.size.y),
			ObjectType.MESH
		);
		// object.matrixAutoUpdate = false;
		// object.lookAt(this.pv.direction);
		// object.updateMatrix();
		CoreTransform.rotateObject(object, DEFAULT_UP, this.pv.direction);
		tmp.copy(this.pv.direction)
			.normalize()
			.multiplyScalar(-0.5 * this.pv.thickness + this.pv.height);
		object.position.copy(tmp);
		object.translateX(this.pv.center.x);
		object.translateZ(this.pv.center.y);
		object.updateMatrix();
		object.name = this.name();

		CorePhysicsAttribute.setRBDType(object, PhysicsRBDType.FIXED);
		CorePhysicsAttribute.setColliderType(object, PhysicsRBDColliderType.CUBOID);
		CorePhysicsAttribute.setDensity(object, 0);
		CorePhysicsAttribute.setFriction(object, this.pv.friction);
		CorePhysicsAttribute.setRestitution(object, this.pv.restitution);
		CorePhysicsAttribute.setCuboidSizes(object, new Vector3(this.pv.size.x, this.pv.thickness, this.pv.size.y));
		CorePhysicsAttribute.setCuboidSize(object, 1);

		this.setObject(object);
	}
}
