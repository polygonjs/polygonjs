/**
 * Just like the Box, with rounded bevels.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CapsuleSopOperation} from '../../operations/sop/Capsule';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {PolyNodeController} from './../utils/poly/PolyNodeController';
// import {NodeContext} from './../../poly/NodeContext';
// import {PolyNodeDataRegister} from '../utils/poly/PolyNodeDataRegister';
// import {PolyNodeDefinition} from '../utils/poly/PolyNodeDefinition';
// import {ParamType} from '../../poly/ParamType';
const DEFAULT = CapsuleSopOperation.DEFAULT_PARAMS;
class CapsuleSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(DEFAULT.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param height */
	height = ParamConfig.FLOAT(DEFAULT.height, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param divisions */
	divisions = ParamConfig.INTEGER(DEFAULT.divisions, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new CapsuleSopParamsConfig();

export class CapsuleSopNode extends TypedSopNode<CapsuleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'capsule';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	private _operation: CapsuleSopOperation | undefined;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._operation = this._operation || new CapsuleSopOperation(this._scene, this.states);
		const coreGroup = this._operation.cook(inputCoreGroups, this.pv);
		this.setCoreGroup(coreGroup);
	}
}

// export function createPlayerCapsulePolyNode() {
// 	const definition: PolyNodeDefinition = {
// 		metadata: {version: {editor: '1.2.19-1', polygonjs: '1.2.19'}, createdAt: 1663027657064},
// 		nodeContext: NodeContext.SOP,
// 		inputs: {simple: {min: 0, max: 0}},
// 		params: [
// 			{name: 'radius', type: ParamType.FLOAT, rawInput: 0.17, initValue: 0.2, options: {}},
// 			{name: 'height', type: ParamType.FLOAT, rawInput: 1, initValue: 1, options: {}},
// 		],
// 		nodes: {
// 			transformToGround: {type: 'transform', params: {t: [0, "-bbox(0, 'min').y", 0]}, inputs: ['capsule1']},
// 			transformForPlayerControls: {
// 				type: 'transform',
// 				params: {t: [0, '-ch("../capsule1/height") + ch("../capsule1/radius")', 0]},
// 				inputs: ['transformToGround'],
// 				flags: {display: true},
// 			},
// 			subnetOutput1: {type: 'subnetOutput', inputs: ['transformForPlayerControls']},
// 			capsule1: {type: 'capsule', params: {radius: 'ch("../radius")', height: 'ch("../height")'}},
// 		},
// 		ui: {
// 			transformToGround: {pos: [300, 0]},
// 			transformForPlayerControls: {pos: [300, 200]},
// 			subnetOutput1: {pos: [300, 400]},
// 			capsule1: {pos: [300, -150]},
// 		},
// 	};
// 	const polyNodeData: PolyNodeDataRegister<NodeContext.SOP> = {
// 		node_context: NodeContext.SOP,
// 		node_type: 'playerCapsule',
// 		data: definition,
// 	};

// 	PolyNodeController.createNodeClassAndRegister(polyNodeData);
// }
