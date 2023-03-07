// /**
//  * utility node that does not change its input
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import {InputCloneMode} from '../../poly/InputCloneMode';

// class NullCsgParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new NullCsgParamsConfig();

// export class NullCsgNode extends TypedCsgNode<NullCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'null';
// 	}
// 	override initializeNode() {
// 		this.io.inputs.setCount(1);
// 		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
// 	}

// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		this.setCsgCoreGroup(inputCoreGroups[0]);
// 	}
// }
