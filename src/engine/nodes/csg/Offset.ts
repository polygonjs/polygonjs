/**
 * Expand the geometry
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
import {CsgCorner, CSG_CORNERS} from '../../../core/geometry/csg/operations/CsgCorner';
const {offset} = jscad.expansions;

class OffsetCsgParamsConfig extends NodeParamsConfig {
	/** @param delta */
	delta = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
	/** @param corners */
	corners = ParamConfig.INTEGER(CSG_CORNERS.indexOf(CsgCorner.ROUND), {
		menu: {entries: CSG_CORNERS.map((name, value) => ({name, value}))},
	});
	/** @param segments */
	segments = ParamConfig.INTEGER(1, {
		range: [1, 8],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new OffsetCsgParamsConfig();

export class OffsetCsgNode extends TypedCsgNode<OffsetCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'offset';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const options: expansions.ExpandOptions = {
			delta: this.pv.delta,
			corners: CSG_CORNERS[this.pv.corners],
			segments: this.pv.segments * 4,
		};
		const objects = inputCoreGroups[0]
			.objects()
			.map((o) => {
				if (jscad.geometries.geom2.isA(o) || jscad.geometries.path2.isA(o)) {
					return offset(options, o);
				} else {
					return o;
				}
			})
			.flat();
		this.setCsgCoreObjects(objects);
	}
}
