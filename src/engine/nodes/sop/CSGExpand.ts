/**
 * Expand the CSG input geometry
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CsgCorner, CSG_CORNERS} from '../../../core/geometry/modules/csg/operations/CsgCorner';
import {CsgGeometry, CsgGeometryType} from '../../../core/geometry/modules/csg/CsgCommon';
import {csgGeometryTypeFromGeometry} from '../../../core/geometry/modules/csg/CsgCoreType';
import {isArray} from '../../../core/Type';
import {expansions, maths, geometries} from '@jscad/modeling';
const {expand} = expansions;

enum ExpandMode {
	_2D_ONLY = '2D Only',
	_2D_AND_3D_ONLY = '2D & 3D (Slow)',
}
const EXPAND_MODES: ExpandMode[] = [ExpandMode._2D_ONLY, ExpandMode._2D_AND_3D_ONLY];

class CSGExpandSopParamsConfig extends NodeParamsConfig {
	/** @param mode */
	mode = ParamConfig.INTEGER(EXPAND_MODES.indexOf(ExpandMode._2D_ONLY), {
		menu: {entries: EXPAND_MODES.map((name, value) => ({name, value}))},
	});
	/** @param delta */
	delta = ParamConfig.FLOAT(0.1, {
		range: [1 * maths.constants.EPS, 1],
		rangeLocked: [true, false],
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
	/** @param allow 3D expand (can be very slow) */
	allowExpand3D = ParamConfig.BOOLEAN(false, {
		// label: 'allow 3D geometries (slow)',
	});
}
const ParamsConfig = new CSGExpandSopParamsConfig();

export class CSGExpandSopNode extends CSGSopNode<CSGExpandSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_EXPAND;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	setMode(mode: ExpandMode) {
		this.p.mode.set(EXPAND_MODES.indexOf(mode));
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();

		if (inputObjects && inputObjects.length != 0) {
			const minDelta = 1 * maths.constants.EPS;
			const delta = Math.max(this.pv.delta, minDelta);
			const options: expansions.ExpandOptions = {
				delta,
				corners: CSG_CORNERS[this.pv.corners],
				segments: this.pv.segments * 4,
			};
			const mode = EXPAND_MODES[this.pv.mode];
			const newGeometries: CsgGeometry[] = [];
			for (const inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				const type = csgGeometryTypeFromGeometry(inputGeometry);
				const is2D = type == CsgGeometryType.PATH2 || type == CsgGeometryType.GEOM2;
				if (is2D || mode == ExpandMode._2D_AND_3D_ONLY) {
					const result = expand(options, inputObject.csgGeometry());
					if (isArray(result)) {
						newGeometries.push(...result);
					} else {
						newGeometries.push(result as geometries.geom2.Geom2);
					}
				}
			}
			this.setCSGGeometries(newGeometries);
		} else {
			this.setCSGObjects([]);
		}
	}
}
