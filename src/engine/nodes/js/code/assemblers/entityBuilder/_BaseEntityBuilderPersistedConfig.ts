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
import type {EntityBuilderSopNode} from '../../../../sop/EntityBuilder';

export interface EntityBuilderFunctionDataAttributeDataItem {
	attribName: string;
	attribType: JsConnectionPointType;
}
export interface EntityBuilderFunctionDataAttributeDataReadWrite {
	read: EntityBuilderFunctionDataAttributeDataItem[];
	write: EntityBuilderFunctionDataAttributeDataItem[];
}
export interface EntityBuilderFunctionData extends SingleBodyFunctionData {
	attributesData: EntityBuilderFunctionDataAttributeDataReadWrite;
}

export interface EntityBuilderPersistedConfigBaseJsData extends SingleBodyPersistedConfigBaseJsData {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
	attributesData: EntityBuilderFunctionDataAttributeDataReadWrite;
}

export class BaseEntityBuilderPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: EntityBuilderSopNode | InstanceBuilderSopNode) {
		super(node);
	}
	override async toData(): Promise<EntityBuilderPersistedConfigBaseJsData | undefined> {
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
		const {functionBody, variableNames, functionNames, paramConfigs, attributesData} = functionData;

		const data: EntityBuilderPersistedConfigBaseJsData = {
			functionBody,
			variableNames,
			variables: serializedVariablesFromFunctionData(functionData),
			functionNames,
			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
			attributesData,
		};
		return data;
	}
	override load(data: EntityBuilderPersistedConfigBaseJsData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBody, variableNames, functionNames, serializedParamConfigs, attributesData} = data;

		const functionData: EntityBuilderFunctionData = {
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
