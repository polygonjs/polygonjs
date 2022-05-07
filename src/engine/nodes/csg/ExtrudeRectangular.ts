/**
 * Extrude the geometry in a rectangle
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import jscad from '@jscad/modeling';
const {extrudeRectangular} = jscad.extrusions;

class ExtrudeRectangularCsgParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new ExtrudeRectangularCsgParamsConfig();

export class ExtrudeRectangularCsgNode extends TypedCsgNode<ExtrudeRectangularCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'extrudeRectangular';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		const options: jscad.extrusions.ExtrudeRectangularOptions = {
			size: this.pv.size,
			height: this.pv.height,
		};
		const objects = inputCoreGroups[0]
			.objects()
			.map((o) => {
				if (jscad.geometries.geom2.isA(o) || jscad.geometries.path2.isA(o)) {
					return extrudeRectangular(options, o);
				} else {
					return o;
				}
			})
			.flat();
		this.setCsgCoreObjects(objects);
	}
}
