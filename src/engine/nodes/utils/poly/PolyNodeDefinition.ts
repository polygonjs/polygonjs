import {ParamOptionToAdd} from '../params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../../io/json/export/Node';
import {NodeContext} from '../../../poly/NodeContext';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface PolyNodeSimpleInputsData {
	min: number;
	max: number;
	names?: string[];
}

export interface PolyNodeTypedInputData {
	type: string;
	name: string;
}
export interface PolyNodeTypedInputsData {
	types: PolyNodeTypedInputData[];
}
export interface PolyNodesInputsData {
	simple?: PolyNodeSimpleInputsData;
	typed?: PolyNodeTypedInputsData;
}
export interface PolyNodeMetadata {
	version: {
		marketplace?: number;
		editor?: string;
		polygonjs: string;
	};
	createdAt: number;
}

export interface PolyNodeDefinition {
	metadata: PolyNodeMetadata;
	nodeContext: NodeContext;
	inputs?: PolyNodesInputsData;
	params?: ParamOptionToAdd<ParamType>[];
	nodes?: PolyDictionary<NodeJsonExporterData>;
	ui?: PolyDictionary<NodeJsonExporterUIData>;
}
