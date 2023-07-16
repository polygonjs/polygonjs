import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {SingleBodyFunctionData} from '../_Base';
import {SerializedVariable, SerializedVariableType} from '../_BaseJsPersistedConfigUtils';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfig, JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {
	SingleBodyPersistedConfigBaseJsData,
	serializedVariablesFromFunctionData,
	variablesByNameFromPersistedConfigData,
	functionsByNameFromPersistedConfigData,
} from '../_BaseJsPersistedConfig';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';
import type {InstanceBuilderSopNode} from '../../../../sop/InstanceBuilder';
import type {PointBuilderSopNode} from '../../../../sop/PointBuilder';

export interface PointBuilderFunctionDataAttributeDataItem {
	attribName: string;
	attribType: JsConnectionPointType;
}
export interface PointBuilderFunctionDataAttributeDataReadWrite {
	read: PointBuilderFunctionDataAttributeDataItem[];
	write: PointBuilderFunctionDataAttributeDataItem[];
}
export interface PointBuilderFunctionData extends SingleBodyFunctionData {
	attributesData: PointBuilderFunctionDataAttributeDataReadWrite;
}

export interface PointBuilderPersistedConfigBaseJsData extends SingleBodyPersistedConfigBaseJsData {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
	attributesData: PointBuilderFunctionDataAttributeDataReadWrite;
}

export class BasePointBuilderPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: PointBuilderSopNode | InstanceBuilderSopNode) {
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
