/**
 * Extrude the CSG geometry
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CsgGeometry, csgIsPath2, csgIsGeom2} from '../../../core/geometry/csg/CsgCommon';
import {extrusions} from '@jscad/modeling';
const {extrudeLinear} = extrusions;

class CSGExtrudeLinearSopParamsConfig extends NodeParamsConfig {
	/** @param height */
	height = ParamConfig.FLOAT(0.5, {
		range: [0.00000001, 1],
		rangeLocked: [true, false],
	});
	/** @param twistAngle */
	twistAngle = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [true, false],
	});
	/** @param twistSteps */
	twistSteps = ParamConfig.INTEGER(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CSGExtrudeLinearSopParamsConfig();

export class CSGExtrudeLinearSopNode extends CSGSopNode<CSGExtrudeLinearSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_EXTRUDE_LINEAR;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();

		if (inputObjects && inputObjects.length != 0) {
			const options: extrusions.ExtrudeLinearOptions = {
				height: this.pv.height,
				twistAngle: this.pv.twistAngle,
				twistSteps: this.pv.twistSteps,
			};
			const newGeometries: CsgGeometry[] = [];
			for (let inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				if (csgIsPath2(inputGeometry) || csgIsGeom2(inputGeometry)) {
					newGeometries.push(extrudeLinear(options, inputGeometry));
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
