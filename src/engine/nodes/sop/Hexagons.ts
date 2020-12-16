/**
 * Creates hexagons on a plane.
 *
 * @remarks
 * This is very similar to the plane SOP, but with hexagonal patterns, which can be more visually pleasing.
 */
import {Vector3} from 'three/src/math/Vector3';
import {TypedSopNode} from './_Base';
import {CoreTransform} from '../../../core/Transform';
import {ObjectType} from '../../../core/geometry/Constant';

import {CoreGeometryOperationHexagon} from '../../../core/geometry/operation/Hexagon';

const DEFAULT_UP = new Vector3(0, 1, 0);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class HexagonsSopParamsConfig extends NodeParamsConfig {
	/** @param plane size */
	size = ParamConfig.VECTOR2([1, 1]);
	/** @param hexagons size */
	hexagon_radius = ParamConfig.FLOAT(0.1, {
		range: [0.001, 1],
		range_locked: [false, false],
	});
	/** @param axis perpendicular to the plane */
	direction = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param do not create polygons, only points */
	points_only = ParamConfig.BOOLEAN(0);
	// no need to have centers, as all points are centers anyway
	//this.add_param( ParamType.TOGGLE, 'centers_only', 0, {visible_if: {points_only: 1}})
}
const ParamsConfig = new HexagonsSopParamsConfig();

export class HexagonsSopNode extends TypedSopNode<HexagonsSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'hexagons';
	}

	private _core_transform = new CoreTransform();

	initialize_node() {}

	cook() {
		if (this.pv.hexagon_radius > 0) {
			const operation = new CoreGeometryOperationHexagon(
				this.pv.size,
				this.pv.hexagon_radius,
				this.pv.points_only
			);
			const geometry = operation.process();

			this._core_transform.rotate_geometry(geometry, DEFAULT_UP, this.pv.direction);

			if (this.pv.points_only) {
				this.set_geometry(geometry, ObjectType.POINTS);
			} else {
				this.set_geometry(geometry);
			}
		} else {
			this.set_objects([]);
		}
	}
}
