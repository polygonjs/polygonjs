// /**
//  * Merges input objects
//  *
//  *
//  */
// import {TypedCadNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CadCoreGroup} from '../../../core/geometry/cad/CadCoreGroup';
// import {CadCoreObject} from '../../../core/geometry/cad/CadCoreObject';
// import {CadObjectType} from '../../../core/geometry/cad/CadCommon';
// import {cadMerge} from '../../../core/geometry/cad/utils/CadMerge';
// import {BaseNodeType} from '../_Base';
// import {NodeEvent} from '../../poly/NodeEvent';
// const DEFAULT_INPUTS_COUNT = 4;

// class MergeCadParamsConfig extends NodeParamsConfig {
// 	/** @param Merge input objects together when possible */
// 	compact = ParamConfig.BOOLEAN(false);
// 	/** @param number of inputs that this node can merge geometries from */
// 	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
// 		range: [1, 32],
// 		rangeLocked: [true, false],
// 		callback: (node: BaseNodeType) => {
// 			MergeCadNode.PARAM_CALLBACK_setInputsCount(node as MergeCadNode);
// 		},
// 	});
// }
// const ParamsConfig = new MergeCadParamsConfig();

// export class MergeCadNode extends TypedCadNode<MergeCadParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'merge';
// 	}

// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1, DEFAULT_INPUTS_COUNT);
// 	}

// 	override cook(inputCoreGroups: CadCoreGroup[]) {
// 		const inputObjects: CadCoreObject<CadObjectType>[] = [];
// 		for (let inputCoreGroup of inputCoreGroups) {
// 			inputObjects.push(...inputCoreGroup.objects());
// 		}
// 		if (this.pv.compact) {
// 			this.setCadObjects(cadMerge(inputObjects));
// 		} else {
// 			this.setCadObjects(inputObjects);
// 		}
// 	}

// 	private _callbackUpdateInputsCount() {
// 		this.io.inputs.setCount(1, this.pv.inputsCount);
// 		this.emit(NodeEvent.INPUTS_UPDATED);
// 	}
// 	static PARAM_CALLBACK_setInputsCount(node: MergeCadNode) {
// 		node._callbackUpdateInputsCount();
// 	}
// }
