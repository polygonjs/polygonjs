/**
 * Creates a CSG torus.
 *
 *
 */
import {CSGSopNode} from './_BaseCSG';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {step} from '../../../core/geometry/csg/CsgConstant';
import {primitives, maths} from '@jscad/modeling';
const {torus} = primitives;

class CSGTorusSopParamsConfig extends NodeParamsConfig {
	/** @param inner radius */
	innerRadius = ParamConfig.FLOAT(0.25, {
		range: [2 * maths.constants.EPS, 1],
		rangeLocked: [true, false],
	});
	/** @param outer radius */
	outerRadius = ParamConfig.FLOAT(1, {
		range: [2 * maths.constants.EPS, 1],
		rangeLocked: [true, false],
	});
	/** @param inner segments */
	innerSegments = ParamConfig.INTEGER(12, {
		range: [3, 32],
		rangeLocked: [true, false],
	});
	/** @param outer segments */
	outerSegments = ParamConfig.INTEGER(32, {
		range: [3, 32],
		rangeLocked: [true, false],
	});
	/** @param inner rotation */
	innerRotation = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [false, false],
	});

	/** @param open */
	open = ParamConfig.BOOLEAN(0);
	/** @param start angle */
	startAngle = ParamConfig.FLOAT(0, {
		range: [0, 2 * Math.PI],
		rangeLocked: [false, false],
		step,
		visibleIf: {open: 1},
	}); /** @param outer rotation */

	outerRotation = ParamConfig.FLOAT('2 * $PI', {
		range: [0, 2 * Math.PI],
		rangeLocked: [false, false],
		step,
		visibleIf: {open: 1},
	});
}
const ParamsConfig = new CSGTorusSopParamsConfig();

export class CSGTorusSopNode extends CSGSopNode<CSGTorusSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CSG_TORUS;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
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

			const innerRadius2 = Math.min(innerRadius, outerRadius - 1 * maths.constants.EPS);
			const geo = torus({
				innerRadius: innerRadius2,
				outerRadius,
				innerSegments,
				outerSegments,
				innerRotation,
				outerRotation: open ? outerRotation : 2 * Math.PI,
				startAngle: open ? startAngle : 0,
			});
			this.setCSGGeometry(geo);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'failed to create geometry';
			this.states.error.set(message);
			this.setCSGObjects([]);
		}
	}
}
