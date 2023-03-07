// /**
//  * switches the input geometry
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import {InputCloneMode} from '../../poly/InputCloneMode';
// import {BaseNodeType} from '../_Base';

// class SwitchCsgParamsConfig extends NodeParamsConfig {
// 	/** @param sets which input is used */
// 	input = ParamConfig.INTEGER(0, {
// 		range: [0, 3],
// 		rangeLocked: [true, true],
// 		callback: (node: BaseNodeType) => {
// 			SwitchCsgNode.PARAM_CALLBACK_setInputsEvaluation(node as SwitchCsgNode);
// 		},
// 	});
// }
// const ParamsConfig = new SwitchCsgParamsConfig();

// export class SwitchCsgNode extends TypedCsgNode<SwitchCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'switch';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(0, 4);
// 		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);

// 		this.io.inputs.onEnsureListenToSingleInputIndexUpdated(async () => {
// 			await this._callbackUpdateInputsEvaluation();
// 		});
// 	}

// 	override async cook(inputCoreGroups: CsgCoreGroup[]) {
// 		const inputIndex = this.pv.input;
// 		if (this.io.inputs.hasInput(inputIndex)) {
// 			const container = await this.containerController.requestInputContainer(inputIndex);
// 			if (container) {
// 				const coreGroup = container.coreContent();
// 				if (coreGroup) {
// 					this.setCsgCoreGroup(coreGroup);
// 					return;
// 				}
// 			}
// 		} else {
// 			this.states.error.set(`no input ${inputIndex}`);
// 		}
// 		this.cookController.endCook();
// 	}

// 	private async _callbackUpdateInputsEvaluation() {
// 		if (this.p.input.isDirty()) {
// 			await this.p.input.compute();
// 		}

// 		this.io.inputs.listenToSingleInputIndex(this.pv.input);
// 	}
// 	static PARAM_CALLBACK_setInputsEvaluation(node: SwitchCsgNode) {
// 		node._callbackUpdateInputsEvaluation();
// 	}
// }
