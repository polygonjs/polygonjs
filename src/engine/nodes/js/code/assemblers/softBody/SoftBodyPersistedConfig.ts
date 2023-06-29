import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {VelocityColliderFunctionData} from '../_Base';
import {SerializedVariable, SerializedVariableType} from '../_BaseJsPersistedConfigUtils';
import {TetSoftBodySolverSopNode} from '../../../../sop/TetSoftBodySolver';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfig, JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {
	PersistedConfigBaseJsData,
	serializedVariablesFromFunctionData,
	variablesByNameFromPersistedConfigData,
	functionsByNameFromPersistedConfigData,
} from '../_BaseJsPersistedConfig';

export interface SoftBodyPersistedConfigBaseJsData extends PersistedConfigBaseJsData {
	functionBodyCollider: string;
	functionBodyVelocity: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
}

export class SoftBodyPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: TetSoftBodySolverSopNode) {
		super(node);
	}
	override async toData(): Promise<SoftBodyPersistedConfigBaseJsData | undefined> {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.functionData();
		if (!functionData) {
			return;
		}
		const {functionBodyVelocity, functionBodyCollider, variableNames, functionNames, paramConfigs} = functionData;

		const data: SoftBodyPersistedConfigBaseJsData = {
			functionBodyVelocity,
			functionBodyCollider,
			variableNames,
			variables: serializedVariablesFromFunctionData(functionData),
			functionNames,
			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
		};
		return data;
	}
	override load(data: SoftBodyPersistedConfigBaseJsData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBodyVelocity, functionBodyCollider, variableNames, functionNames, serializedParamConfigs} = data;

		const functionData: VelocityColliderFunctionData = {
			functionBodyVelocity,
			functionBodyCollider,
			variableNames,
			variablesByName: variablesByNameFromPersistedConfigData(data),
			functionNames,
			functionsByName: functionsByNameFromPersistedConfigData(data, this.node),
			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
		};
		this.node.updateFromFunctionData(functionData);
	}
}
