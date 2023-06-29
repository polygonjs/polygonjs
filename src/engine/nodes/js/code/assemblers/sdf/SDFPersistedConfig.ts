import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {SingleBodyFunctionData} from '../_Base';
import {SerializedVariable, SerializedVariableType} from '../_BaseJsPersistedConfigUtils';
import {SDFBuilderSopNode} from '../../../../sop/SDFBuilder';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfig, JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {
	PersistedConfigBaseJsData,
	serializedVariablesFromFunctionData,
	variablesByNameFromPersistedConfigData,
	functionsByNameFromPersistedConfigData,
} from '../_BaseJsPersistedConfig';

export interface SDFPersistedConfigBaseJsData extends PersistedConfigBaseJsData {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
}

export class SDFPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: SDFBuilderSopNode) {
		super(node);
	}
	override async toData(): Promise<SDFPersistedConfigBaseJsData | undefined> {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.functionData();
		if (!functionData) {
			return;
		}
		const {functionBody, variableNames, functionNames, paramConfigs} = functionData;

		const data: SDFPersistedConfigBaseJsData = {
			functionBody,
			variableNames,
			variables: serializedVariablesFromFunctionData(functionData),
			functionNames,
			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
		};
		return data;
	}
	override load(data: SDFPersistedConfigBaseJsData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBody, variableNames, functionNames, serializedParamConfigs} = data;

		const functionData: SingleBodyFunctionData = {
			functionBody: functionBody,
			variableNames,
			variablesByName: variablesByNameFromPersistedConfigData(data),
			functionNames,
			functionsByName: functionsByNameFromPersistedConfigData(data, this.node),
			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
		};
		this.node.updateFromFunctionData(functionData);
	}
}
