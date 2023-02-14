/**
 * Creates polygons.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import type {maths} from '@jscad/modeling';
import {primitives} from '@jscad/modeling';
import {csgVec2sToJSON} from '../../../core/geometry/csg/math/CsgMathVec2';
const {polygon} = primitives;

const DEFAULT_POINTS: maths.vec2.Vec2[] = [
	[-1, -1],
	[-1, 1],
	[1, 1],
	[1, -1],
];
const DEFAULT_PATHS: Array<Array<number>> = [[0, 1, 2, 3]];

class PolygonCsgParamsConfig extends NodeParamsConfig {
	/** @param points */
	points = ParamConfig.STRING(JSON.stringify(csgVec2sToJSON(DEFAULT_POINTS)));
	/** @param paths */
	paths = ParamConfig.STRING(JSON.stringify(DEFAULT_PATHS));
}
const ParamsConfig = new PolygonCsgParamsConfig();

export class PolygonCsgNode extends TypedCsgNode<PolygonCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'polygon';
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		try {
			const points = JSON.parse(this.pv.points);
			const paths = JSON.parse(this.pv.paths);
			const geo = polygon({
				points,
				paths,
			});
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
