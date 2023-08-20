/**
 * Creates a markov solver.
 *
 */

import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {Interpreter} from '../../../core/mjr/Interpreter';
class MarkovSolverSopParamsConfig extends NodeParamsConfig {
	/** @param size of the box */
	size = ParamConfig.VECTOR3([5, 5, 5]);
}
const ParamsConfig = new MarkovSolverSopParamsConfig();

export class MarkovSolverSopNode extends TypedSopNode<MarkovSolverSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'markovSolver';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const elem = new Element();
		const interpreter = Interpreter.load(elem, this.pv.size.x, this.pv.size.y, this.pv.size.z);
		console.log(interpreter);
		this.setCoreGroup(inputCoreGroups[0]);
	}
}
