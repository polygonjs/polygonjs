/**
 * Creates a tube.
 *
 *
 */
import {TypedSopNode} from './_Base';

import {Vector3} from 'three/src/math/Vector3';
import {CylinderBufferGeometry} from 'three/src/geometries/CylinderGeometry';
import {CoreTransform} from '../../../core/Transform';

const DEFAULT_UP = new Vector3(0, 1, 0);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
class TubeSopParamsConfig extends NodeParamsConfig {
	/** @param tube radius */
	radius = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param tube height */
	height = ParamConfig.FLOAT(1, {range: [0, 1]});
	/** @param number of segments in the radial direction */
	segmentsRadial = ParamConfig.INTEGER(12, {range: [3, 20], rangeLocked: [true, false]});
	/** @param number of segments in the height direction */
	segmentsHeight = ParamConfig.INTEGER(1, {range: [1, 20], rangeLocked: [true, false]});
	/** @param adds caps */
	cap = ParamConfig.BOOLEAN(1);
	/** @param center of the tube */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param direction of the tube */
	direction = ParamConfig.VECTOR3([0, 0, 1]);
}
const ParamsConfig = new TubeSopParamsConfig();

export class TubeSopNode extends TypedSopNode<TubeSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'tube';
	}

	private _core_transform = new CoreTransform();

	cook() {
		const geometry = new CylinderBufferGeometry(
			this.pv.radius,
			this.pv.radius,
			this.pv.height,
			this.pv.segmentsRadial,
			this.pv.segmentsHeight,
			!isBooleanTrue(this.pv.cap)
		);

		this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);
		geometry.translate(this.pv.center.x, this.pv.center.y, this.pv.center.z);

		this.setGeometry(geometry);
	}
}
