/**
 * switches the input geometry
 *
 *
 */
import {TypedCsgNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
import {InputCloneMode} from '../../poly/InputCloneMode';

class SwitchCsgParamsConfig extends NodeParamsConfig {
	/** @param sets which input is used */
	input = ParamConfig.INTEGER(0, {
		range: [0, 3],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SwitchCsgParamsConfig();

export class SwitchCsgNode extends TypedCsgNode<SwitchCsgParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'switch';
	}
	protected override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
		this.cookController.disallowInputsEvaluation();
	}

	override async cook(inputCoreGroups: CsgCoreGroup[]) {
		const inputIndex = this.pv.input;
		if (this.io.inputs.hasInput(inputIndex)) {
			const container = await this.containerController.requestInputContainer(inputIndex);
			if (container) {
				const coreGroup = container.coreContent();
				if (coreGroup) {
					this.setCsgCoreGroup(coreGroup);
					return;
				}
			}
		} else {
			this.states.error.set(`no input ${inputIndex}`);
		}
		this.cookController.endCook();
	}
}
