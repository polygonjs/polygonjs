import {BasePersistedConfig} from '../../../../utils/BasePersistedConfig';
import {SingleBodyFunctionData} from '../_Base';
import {SerializedVariable, SerializedVariableType} from '../_BaseJsPersistedConfigUtils';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfig, JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {EvaluatorEventData} from './ActorEvaluator';
import {ActorBuilderNode} from '../../../../../scene/utils/ActorsManager';
import {
	PersistedConfigBaseJsData,
	serializedVariablesFromFunctionData,
	variablesByNameFromPersistedConfigData,
	functionsByNameFromPersistedConfigData,
} from '../_BaseJsPersistedConfig';
export interface ActorFunctionData extends SingleBodyFunctionData {
	eventDatas: EvaluatorEventData[];
}

export interface ActorPersistedConfigBaseJsData extends PersistedConfigBaseJsData {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
	eventDatas: EvaluatorEventData[];
}

export class ActorPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: ActorBuilderNode) {
		super(node);
	}
	override async toData(): Promise<ActorPersistedConfigBaseJsData | undefined> {
		// we need to compute the node here it case it hasn't yet,
		// otherwise the .functionData() will be empty
		await this.node.compile();
		//
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.compilationController.functionData();
		if (!functionData) {
			return;
		}
		const {functionBody, variableNames, functionNames, paramConfigs, eventDatas} = functionData;

		const data: ActorPersistedConfigBaseJsData = {
			functionBody,
			variableNames,
			variables: serializedVariablesFromFunctionData(functionData),
			functionNames,
			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
			eventDatas,
		};
		return data;
	}
	override load(data: ActorPersistedConfigBaseJsData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBody, variableNames, functionNames, serializedParamConfigs, eventDatas} = data;

		const functionData: ActorFunctionData = {
			functionBody: functionBody,
			variableNames,
			variablesByName: variablesByNameFromPersistedConfigData(data),
			functionNames,
			functionsByName: functionsByNameFromPersistedConfigData(data, this.node),
			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
			eventDatas,
		};
		this.node.compilationController.updateFromFunctionData(functionData);
	}
}
