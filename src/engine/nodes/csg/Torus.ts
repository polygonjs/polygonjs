/**
 * Creates a torus.
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {step} from '../../../core/geometry/csg/CsgUiUtils';
import jscad from '@jscad/modeling';
const {torus} = jscad.primitives;

class TorusCsgParamsConfig extends NodeParamsConfig {
	/** @param inner radius */
	innerRadius = ParamConfig.FLOAT(0.5, {
		range: [2 * jscad.maths.constants.EPS, 1],
		rangeLocked: [true, false],
	});
	/** @param outer radius */
	outerRadius = ParamConfig.FLOAT(0.5, {
		range: [2 * jscad.maths.constants.EPS, 1],
		rangeLocked: [true, false],
	});
	/** @param inner segments */
	innerSegments = ParamConfig.INTEGER(8, {
		range: [3, 32],
		rangeLocked: [true, false],
	});
	/** @param outer segments */
	outerSegments = ParamConfig.INTEGER(8, {
		range: [3, 32],
		rangeLocked: [true, false],
	});
	/** @param inner rotation */
	innerRotation = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [false, false],
	});
	/** @param start angle */
	startAngle = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [false, false],
		step,
	});
	/** @param open */
	open = ParamConfig.BOOLEAN(0);
	/** @param outer rotation */
	outerRotation = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [false, false],
		step,
		visibleIf: {open: 1},
	});
}
const ParamsConfig = new TorusCsgParamsConfig();

export class TorusCsgNode extends TypedCsgNode<TorusCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'torus';
	}

	override cook(inputCoreGroups: CsgCoreGroup[]) {
		try {
			const {
				innerRadius,
				outerRadius,
				innerSegments,
				outerSegments,
				innerRotation,
				open,
				outerRotation,
				startAngle,
			} = this.pv;

			const innerRadius2 = Math.min(innerRadius, outerRadius - 1 * jscad.maths.constants.EPS);
			const geo = torus({
				innerRadius: innerRadius2,
				outerRadius,
				innerSegments,
				outerSegments,
				innerRotation,
				outerRotation: open ? outerRotation : 2 * Math.PI,
				startAngle,
			});
			this.setCsgCoreObject(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCsgCoreObjects([]);
		}
	}
}
