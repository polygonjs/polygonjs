/**
 * Create a physics ground
 *
 *
 */
import {CoreTransform} from './../../../core/Transform';
import {ObjectType} from './../../../core/geometry/Constant';
import {BoxBufferGeometry, Mesh, Vector3} from 'three';
import {CorePhysicsAttribute, PhysicsRBDColliderType, PhysicsRBDType} from './../../../core/physics/PhysicsAttribute';
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreConstant} from '../../../core/geometry/Constant';

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
	/** @param restitution */
	restitution = ParamConfig.FLOAT(0.5, {
		separatorBefore: true,
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new PhysicsGroundSopParamsConfig();

export class PhysicsGroundSopNode extends TypedSopNode<PhysicsGroundSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsGround';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _coreTransform = new CoreTransform();
	override async cook() {
		const thickness = this.pv.thickness;
		const object = new Mesh(
			new BoxBufferGeometry(this.pv.size.x, thickness, this.pv.size.y),
			CoreConstant.MATERIALS[ObjectType.MESH]
		);
		// object.matrixAutoUpdate = false;
		// object.lookAt(this.pv.direction);
		// object.updateMatrix();
		this._coreTransform.rotateObject(object, DEFAULT_UP, this.pv.direction);
		tmp.copy(this.pv.direction)
			.normalize()
			.multiplyScalar(-0.5 * this.pv.thickness + this.pv.height);
		object.position.copy(tmp);
		object.translateX(this.pv.center.x);
		object.translateZ(this.pv.center.y);
		object.updateMatrix();
		object.name = 'ground';

		CorePhysicsAttribute.setRBDType(object, PhysicsRBDType.FIXED);
		CorePhysicsAttribute.setColliderType(object, PhysicsRBDColliderType.CUBOID);
		CorePhysicsAttribute.setRestitution(object, this.pv.restitution);
		CorePhysicsAttribute.setCuboidSize(
			object,
			new Vector3(this.pv.size.x * 0.5, this.pv.thickness * 0.5, this.pv.size.y * 0.5)
		);

		this.setObject(object);
	}
}
