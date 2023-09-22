/**
 * Extrude the CSG geometry in a rectangle
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CsgGeometry} from '../../../core/geometry/modules/csg/CsgCommon';
import {csgIsPath2, csgIsGeom2} from '../../../core/geometry/modules/csg/CsgCoreType';
import {extrusions} from '@jscad/modeling';
const {extrudeRectangular} = extrusions;

class CSGExtrudeRectangularSopParamsConfig extends NodeParamsConfig {
	/** @param size */
	size = ParamConfig.FLOAT(0.5, {
		range: [0.00000001, 1],
		rangeLocked: [true, false],
	});
	/** @param height */
	height = ParamConfig.FLOAT(0.5, {
		range: [0.00000001, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CSGExtrudeRectangularSopParamsConfig();

export class CSGExtrudeRectangularSopNode extends CSGSopNode<CSGExtrudeRectangularSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_EXTRUDE_RECTANGULAR;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();

		if (inputObjects && inputObjects.length != 0) {
			const options: extrusions.ExtrudeRectangularOptions = {
				size: this.pv.size,
				height: this.pv.height,
			};
			const newGeometries: CsgGeometry[] = [];
			for (const inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				if (csgIsPath2(inputGeometry) || csgIsGeom2(inputGeometry)) {
					newGeometries.push(extrudeRectangular(options, inputGeometry));
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
