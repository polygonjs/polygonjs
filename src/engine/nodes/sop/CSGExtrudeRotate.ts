/**
 * Extrude the CSG geometry and rotates it
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/modules/csg/CsgConstant';
import {CsgGeometry} from '../../../core/geometry/modules/csg/CsgCommon';
import {csgIsGeom2} from '../../../core/geometry/modules/csg/CsgCoreType';
import {extrusions} from '@jscad/modeling';
const {extrudeRotate} = extrusions;

class CSGExtrudeRotateSopParamsConfig extends NodeParamsConfig {
	/** @param angle */
	angle = ParamConfig.FLOAT(0, {
		range: [-2 * Math.PI, 2 * Math.PI],
		rangeLocked: [false, false],
		step,
	});
	/** @param start angle */
	startAngle = ParamConfig.FLOAT(0, {
		range: [-2 * Math.PI, 2 * Math.PI],
		rangeLocked: [false, false],
		step,
	});
	/** @param segments */
	segments = ParamConfig.INTEGER(4, {
		range: [1, 64],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CSGExtrudeRotateSopParamsConfig();

export class CSGExtrudeRotateSopNode extends CSGSopNode<CSGExtrudeRotateSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_EXTRUDE_ROTATE;
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects = inputCoreGroups[0].csgObjects();
		if (inputObjects && inputObjects.length != 0) {
			const options: extrusions.ExtrudeRotateOptions = {
				angle: this.pv.angle,
				startAngle: this.pv.startAngle,
				segments: this.pv.segments * 4,
			};
			const newGeometries: CsgGeometry[] = [];
			for (let inputObject of inputObjects) {
				const inputGeometry = inputObject.csgGeometry();
				if (csgIsGeom2(inputGeometry)) {
					newGeometries.push(extrudeRotate(options, inputGeometry));
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
