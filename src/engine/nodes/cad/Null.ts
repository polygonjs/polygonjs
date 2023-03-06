// /**
//  * This node does not change the input geometry.
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {NodeParamsConfig} from '../utils/params/ParamsConfig';
// class NullCadParamsConfig extends NodeParamsConfig {}
// const ParamsConfig = new NullCadParamsConfig();

// export class NullCadNode extends TypedCadNode<NullCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'null';
// 	}

// 	override initializeNode() {
// 		this.io.inputs.setCount(0, 1);
// 	}

// 	override cook(inputCoreGroups: CadCoreGroup[]) {
// 		const inputCoreGroup = inputCoreGroups[0];
// 		const inputObjects = inputCoreGroup ? inputCoreGroup.objects() : [];

// 		this.setCadObjects(inputObjects);
// 	}
// }
