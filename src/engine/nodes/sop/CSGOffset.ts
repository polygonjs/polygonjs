/**
 * Expand the CSG geometry
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CsgGeometry} from '../../../core/geometry/modules/csg/CsgCommon';
import {csgIsPath2, csgIsGeom2} from '../../../core/geometry/modules/csg/CsgCoreType';
import {CsgCorner, CSG_CORNERS} from '../../../core/geometry/modules/csg/operations/CsgCorner';
import jscad from '@jscad/modeling';
const {offset} = jscad.expansions;

class CSGOffsetSopParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new CSGOffsetSopParamsConfig();

export class CSGOffsetSopNode extends CSGSopNode<CSGOffsetSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_OFFSET;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();
		if (inputObjects && inputObjects.length != 0) {
			const options: expansions.ExpandOptions = {
				delta: this.pv.delta,
				corners: CSG_CORNERS[this.pv.corners],
				segments: this.pv.segments * 4,
			};
			const newGeometries: CsgGeometry[] = [];
			for (const inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				if (csgIsGeom2(inputGeometry) || csgIsPath2(inputGeometry)) {
					newGeometries.push(offset(options, inputGeometry));
				} else {
					newGeometries.push(inputGeometry);
				}
			}
			this.setCSGGeometries(newGeometries);
		} else {
			this.setCSGObjects([]);
		}
	}
}
