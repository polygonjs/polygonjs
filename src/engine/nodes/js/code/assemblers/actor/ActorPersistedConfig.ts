import {BasePersistedConfig, PersistedConfigWithShaders} from '../../../../utils/BasePersistedConfig';
import {FunctionData} from '../_Base';
import {
	RegisterableVariable,
	SerializedVariable,
	SerializedVariableType,
	serializeVariable,
	deserializeVariable,
} from '../_BaseJsPersistedConfigUtils';
import {ActorJsSopNode} from '../../../../sop/ActorJs';
import {Poly} from '../../../../../Poly';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';
import {EvaluatorEventData} from './Evaluator';

export interface ActorFunctionData extends FunctionData {
	eventDatas: EvaluatorEventData[];
}

export interface PersistedConfigBaseSDFData extends PersistedConfigWithShaders {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
	eventDatas: EvaluatorEventData[];
}

export class ActorPersistedConfig extends BasePersistedConfig {
	constructor(protected override node: ActorJsSopNode) {
		super(node);
	}
	override async toData(): Promise<PersistedConfigBaseSDFData | undefined> {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.functionData();
		if (!functionData) {
			return;
		}
		const {functionBody, variableNames, variablesByName, functionNames, serializedParamConfigs, eventDatas} =
			functionData;

		const serializedVariables: SerializedVariable<SerializedVariableType>[] = [];
		for (let variableName of variableNames) {
			const variable = variablesByName[variableName];
			if (variable != null) {
				const serialized = serializeVariable(variable);
				serializedVariables.push(serialized);
			}
		}

		const data: PersistedConfigBaseSDFData = {
			functionBody,
			variableNames,
			variables: serializedVariables,
			functionNames,
			serializedParamConfigs,
			eventDatas,
		};
		return data;
	}
	override load(data: PersistedConfigBaseSDFData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBody, variableNames, variables, functionNames, serializedParamConfigs, eventDatas} = data;

		const variablesByName: Record<string, RegisterableVariable> = {};
		let i = 0;
		for (let variableName of variableNames) {
			const serialized = variables[i];
			const deserialized = deserializeVariable(serialized);
			variablesByName[variableName] = deserialized;
			i++;
		}

		const functionsByName: Record<string, Function> = {};
		i = 0;
		for (let functionName of functionNames) {
			const namedFunction = Poly.namedFunctionsRegister.getFunction(functionName, this.node);
			if (namedFunction) {
				functionsByName[functionName] = namedFunction.func.bind(namedFunction);
			}
			i++;
		}

		const functionData: ActorFunctionData = {
			functionBody: functionBody,
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			serializedParamConfigs,
			eventDatas,
		};
		this.node.updateFromFunctionData(functionData);
	}
}
