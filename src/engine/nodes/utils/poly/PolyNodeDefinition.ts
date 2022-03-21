import {ParamOptionToAdd} from '../params/ParamsController';
import {ParamType} from '../../../poly/ParamType';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../../io/json/export/Node';
import {NodeContext} from '../../../poly/NodeContext';
import {PolyDictionary} from '../../../../types/GlobalTypes';

export interface PolyNodeDefinition {
	nodeContext: NodeContext;
	inputs?: [number, number];
	params?: ParamOptionToAdd<ParamType>[];
	nodes?: PolyDictionary<NodeJsonExporterData>;
	ui?: PolyDictionary<NodeJsonExporterUIData>;
}
