/**
 * Merges CAD input objects
 *
 *
 */
import {CADSopNode} from './_BaseCAD';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CadGeometryType} from '../../../core/geometry/cad/CadCommon';
import {cadMerge} from '../../../core/geometry/cad/utils/CadMerge';
import {BaseNodeType} from '../_Base';
import {NodeEvent} from '../../poly/NodeEvent';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadObject} from '../../../core/geometry/cad/CadObject';
const DEFAULT_INPUTS_COUNT = 4;

class CADMergeSopParamsConfig extends NodeParamsConfig {
	/** @param Merge input objects together when possible */
	compact = ParamConfig.BOOLEAN(false);
	/** @param number of inputs that this node can merge geometries from */
	inputsCount = ParamConfig.INTEGER(DEFAULT_INPUTS_COUNT, {
		range: [1, 32],
		rangeLocked: [true, false],
		callback: (node: BaseNodeType) => {
			CADMergeSopNode.PARAM_CALLBACK_setInputsCount(node as CADMergeSopNode);
		},
	});
}
const ParamsConfig = new CADMergeSopParamsConfig();

export class CADMergeSopNode extends CADSopNode<CADMergeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_MERGE;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1, DEFAULT_INPUTS_COUNT);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const inputObjects: CadObject<CadGeometryType>[] = [];
		for (let inputCoreGroup of inputCoreGroups) {
			const cadObjects = inputCoreGroup.cadObjects();
			if (cadObjects) {
				inputObjects.push(...cadObjects);
			}
		}
		if (this.pv.compact) {
			this.setCADObjects(cadMerge(inputObjects));
		} else {
			this.setCADObjects(inputObjects);
		}
	}

	private _callbackUpdateInputsCount() {
		this.io.inputs.setCount(1, this.pv.inputsCount);
		this.emit(NodeEvent.INPUTS_UPDATED);
	}
	static PARAM_CALLBACK_setInputsCount(node: CADMergeSopNode) {
		node._callbackUpdateInputsCount();
	}
}
