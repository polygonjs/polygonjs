import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {VelocityColliderFunctionBody, VelocityColliderFunctionData} from '../_Base';
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
	functionBody: VelocityColliderFunctionBody;
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
		// we need to compute the node here it case it hasn't yet,
		// otherwise the .functionData() will be empty
		await this.node.compile();
		//
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.functionData();
		if (!functionData) {
			return;
		}
		const {functionBody, variableNames, functionNames, paramConfigs} = functionData;

		const data: SoftBodyPersistedConfigBaseJsData = {
			functionBody,
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

		const {functionBody, variableNames, functionNames, serializedParamConfigs} = data;

		const functionData: VelocityColliderFunctionData = {
			functionBody,
			variableNames,
			variablesByName: variablesByNameFromPersistedConfigData(data),
			functionNames,
			functionsByName: functionsByNameFromPersistedConfigData(data, this.node),
			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
		};
		this.node.updateFromFunctionData(functionData);
	}
}
