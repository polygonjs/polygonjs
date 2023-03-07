// /**
//  * merge the inputs geometries
//  *
//  *
//  */
// import {TypedCsgNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {CsgCoreGroup} from '../../../core/geometry/csg/CsgCoreGroup';
// import {BaseNodeType} from '../_Base';
// import {NodeEvent} from '../../poly/NodeEvent';
// import {csgObjectType, CsgObjectType} from '../../../core/geometry/csg/CsgToObject3D';
// import {CsgObject} from '../../../core/geometry/csg/CsgCoreObject';
// import {MapUtils} from '../../../core/MapUtils';
// import {booleans} from '@jscad/modeling';
// const {union} = booleans;
// const DEFAULT_INPUTS_COUNT = 4;

// class MergeCsgParamsConfig extends NodeParamsConfig {
// 	/** @param When off, input objects remain separate. When on, they are merged together by type (mesh, points and lines). In order to merge them correctly, you'll have to make sure they have the same attributes */
// 	compact = ParamConfig.BOOLEAN(0);
// 	/** @param number of inputs that this node can merge geometries from */
// 	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
// 		range: [1, 32],
// 		rangeLocked: [true, false],
// 		callback: (node: BaseNodeType) => {
// 			MergeCsgNode.PARAM_CALLBACK_setInputsCount(node as MergeCsgNode);
// 		},
// 	});
// }
// const ParamsConfig = new MergeCsgParamsConfig();

// export class MergeCsgNode extends TypedCsgNode<MergeCsgParamsConfig> {
// 	override paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'merge';
// 	}
// 	protected override initializeNode() {
// 		this.io.inputs.setCount(1, DEFAULT_INPUTS_COUNT);
// 		this.params.onParamsCreated('update inputs', () => {
// 			this._callbackUpdateInputsCount();
// 		});
// 	}

// 	override cook(inputCoreGroups: CsgCoreGroup[]) {
// 		if (this.pv.compact) {
// 			this._mergeWithCompact(inputCoreGroups);
// 		} else {
// 			this._mergeWithoutCompact(inputCoreGroups);
// 		}
// 	}

// 	private _mergeWithCompact(inputCoreGroups: CsgCoreGroup[]) {
// 		const objectsByType: Map<CsgObjectType, CsgObject[]> = new Map();
// 		for (let inputGroup of inputCoreGroups) {
// 			const objects = inputGroup.objects();
// 			for (let object of objects) {
// 				const type = csgObjectType(object);
// 				MapUtils.pushOnArrayAtEntry(objectsByType, type, object);
// 			}
// 		}
// 		const mergedObjects: CsgObject[] = [];
// 		objectsByType.forEach((objects, type) => {
// 			const mergedObject = union(objects as Array<geometries.geom2.Geom2>);
// 			mergedObjects.push(mergedObject);
// 		});
// 		this.setCsgCoreObjects(mergedObjects);
// 	}
// 	private _mergeWithoutCompact(inputCoreGroups: CsgCoreGroup[]) {
// 		const objects = inputCoreGroups.map((coreGroup) => (coreGroup ? coreGroup.objects() : [])).flat();
// 		this.setCsgCoreObjects(objects);
// 	}

// 	private _callbackUpdateInputsCount() {
// 		this.io.inputs.setCount(1, this.pv.inputsCount);
// 		this.emit(NodeEvent.INPUTS_UPDATED);
// 	}
// 	static PARAM_CALLBACK_setInputsCount(node: MergeCsgNode) {
// 		node._callbackUpdateInputsCount();
// 	}
// }
