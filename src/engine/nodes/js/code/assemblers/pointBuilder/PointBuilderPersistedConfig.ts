import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {FunctionData} from '../_Base';
import {SerializedVariable, SerializedVariableType} from '../_BaseJsPersistedConfigUtils';
import {PointBuilderSopNode} from '../../../../sop/PointBuilder';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfig, JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {
	PersistedConfigBaseJsData,
	serializedVariablesFromFunctionData,
	variablesByNameFromPersistedConfigData,
	functionsByNameFromPersistedConfigData,
} from '../_BaseJsPersistedConfig';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';

export interface PointBuilderFunctionDataAttributeDataItem {
	attribName: string;
	attribType: JsConnectionPointType;
}
export interface PointBuilderFunctionDataAttributeDataReadWrite {
	read: PointBuilderFunctionDataAttributeDataItem[];
	write: PointBuilderFunctionDataAttributeDataItem[];
}
export interface PointBuilderFunctionData extends FunctionData {
	attributesData: PointBuilderFunctionDataAttributeDataReadWrite;
}

export interface PointBuilderPersistedConfigBaseJsData extends PersistedConfigBaseJsData {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
	attributesData: PointBuilderFunctionDataAttributeDataReadWrite;
}

export class PointBuilderPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: PointBuilderSopNode) {
		super(node);
	}
	override async toData(): Promise<PointBuilderPersistedConfigBaseJsData | undefined> {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.functionData();
		if (!functionData) {
			return;
		}
		const {functionBody, variableNames, functionNames, paramConfigs, attributesData} = functionData;

		const data: PointBuilderPersistedConfigBaseJsData = {
			functionBody,
			variableNames,
			variables: serializedVariablesFromFunctionData(functionData),
			functionNames,
			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
			attributesData,
		};
		return data;
	}
	override load(data: PointBuilderPersistedConfigBaseJsData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBody, variableNames, functionNames, serializedParamConfigs, attributesData} = data;

		const functionData: PointBuilderFunctionData = {
			functionBody: functionBody,
			variableNames,
			variablesByName: variablesByNameFromPersistedConfigData(data),
			functionNames,
			functionsByName: functionsByNameFromPersistedConfigData(data, this.node),
			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
			attributesData,
		};
		this.node.updateFromFunctionData(functionData);
	}
}
