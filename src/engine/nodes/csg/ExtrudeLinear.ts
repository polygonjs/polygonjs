/**
 * Extrude the geometry
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {extrusions, geometries} from '@jscad/modeling';
const {extrudeLinear} = extrusions;

class ExtrudeLinearCsgParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new ExtrudeLinearCsgParamsConfig();

export class ExtrudeLinearCsgNode extends TypedCsgNode<ExtrudeLinearCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'extrudeLinear';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const options: extrusions.ExtrudeLinearOptions = {
			height: this.pv.height,
			twistAngle: this.pv.twistAngle,
			twistSteps: this.pv.twistSteps,
		};
		const objects = inputCoreGroups[0]
			.objects()
			.map((o) => {
				if (geometries.geom2.isA(o) || geometries.path2.isA(o)) {
					return extrudeLinear(options, o);
				} else {
					return o;
				}
			})
			.flat();
		this.setCsgCoreObjects(objects);
	}
}
