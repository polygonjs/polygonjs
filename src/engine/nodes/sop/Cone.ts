/**
 * Creates a cone
 *
 *
 */
import {TypedSopNode} from './_Base';

import {Vector3} from 'three/src/math/Vector3';
import {ConeBufferGeometry} from 'three/src/geometries/ConeGeometry';
import {CoreTransform} from '../../../core/Transform';

const DEFAULT_UP = new Vector3(0, 1, 0);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class ConeSopParamsConfig extends NodeParamsConfig {
	/** @param cone radius */
	radius = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param cone height */
	height = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param radial segments count */
	segmentsRadial = ParamConfig.INTEGER(12, {range: [3, 20], rangeLocked: [true, false]});
	/** @param height segments count */
	segmentsHeight = ParamConfig.INTEGER(1, {range: [1, 20], rangeLocked: [true, false]});
	/** @param adds a cap */
	cap = ParamConfig.BOOLEAN(1);
	/** @param theta start */
	thetaStart = ParamConfig.FLOAT(1, {range: [0, Math.PI * 2]});
	/** @param start length */
	thetaLength = ParamConfig.FLOAT('2*$PI', {range: [0, Math.PI * 2]});
	/** @param center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param direction */
	direction = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new ConeSopParamsConfig();

export class ConeSopNode extends TypedSopNode<ConeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'cone';
	}

	private _core_transform = new CoreTransform();

	cook() {
		const geometry = new ConeBufferGeometry(
			this.pv.radius,
			this.pv.height,
			this.pv.segmentsRadial,
			this.pv.segmentsHeight,
			!this.pv.cap,
			this.pv.thetaStart,
			this.pv.thetaLength
		);

		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);

		this.setGeometry(geometry);
	}
}
