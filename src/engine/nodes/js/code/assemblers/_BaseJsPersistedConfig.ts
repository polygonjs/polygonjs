import {PersistedConfigWithShaders} from '../../.././utils/BasePersistedConfig';
import {BaseJsShaderAssembler, FunctionData} from './_Base';
import {
	RegisterableVariable,
	SerializedVariable,
	SerializedVariableType,
	isVariableSerializable,
	serializeVariable,
	deserializeVariable,
} from './_BaseJsPersistedConfigUtils';
// import {SDFBuilderSopNode} from '../../../../sop/SDFBuilder';
import {Poly} from '../../../../Poly';
import {NamedFunctionMap} from '../../../../poly/registers/functions/All';
import {JsParamConfigJSON} from '../utils/JsParamConfig';
import {ParamType} from '../../../../poly/ParamType';
import {AssemblerControllerNode} from '../Controller';

export interface PersistedConfigBaseJsData extends PersistedConfigWithShaders {
	functionBody: string;
	variableNames: string[];
	variables: SerializedVariable<SerializedVariableType>[];
	functionNames: Array<keyof NamedFunctionMap>;
	serializedParamConfigs: JsParamConfigJSON<ParamType>[];
}

export function serializedVariablesFromFunctionData(functionData: FunctionData) {
	const {variableNames, variablesByName} = functionData;
	const serializedVariables: SerializedVariable<SerializedVariableType>[] = [];
	for (let variableName of variableNames) {
		const variable = variablesByName[variableName];
		if (variable != null && isVariableSerializable(variable)) {
			const serialized = serializeVariable(variable);
			serializedVariables.push(serialized);
		}
	}
	return serializedVariables;
}
export function variablesByNameFromPersistedConfigData(data: PersistedConfigBaseJsData) {
	const {variableNames, variables} = data;
	const variablesByName: Record<string, RegisterableVariable> = {};
	let i = 0;
	for (let variableName of variableNames) {
		const serialized = variables[i];
		const deserialized = deserializeVariable(serialized);
		variablesByName[variableName] = deserialized;
		i++;
	}
	return variablesByName;
}
export function functionsByNameFromPersistedConfigData(
	data: PersistedConfigBaseJsData,
	node: AssemblerControllerNode<BaseJsShaderAssembler>
) {
	const {functionNames} = data;
	const functionsByName: Record<string, Function> = {};
	// let i = 0;
	for (let functionName of functionNames) {
		const namedFunction = Poly.namedFunctionsRegister.getFunction(functionName, node);
		if (namedFunction) {
			functionsByName[functionName] = namedFunction.func.bind(namedFunction);
		}
		// i++;
	}
	return functionsByName;
}

// export class SDFPersistedConfig extends BasePersistedConfig {
// 	constructor(protected override node: AssemblerControllerNode<BaseJsShaderAssembler>) {
// 		super(node);
// 	}
// 	override async toData(): Promise<PersistedConfigBaseJsData | undefined> {
// 		const assemblerController = this.node.assemblerController();
// 		if (!assemblerController) {
// 			return;
// 		}
// 		const functionData = this.node.functionData();
// 		if (!functionData) {
// 			return;
// 		}
// 		const {functionBody, variableNames, functionNames, paramConfigs} = functionData;

// 		const data: PersistedConfigBaseJsData = {
// 			functionBody,
// 			variableNames,
// 			variables: serializedVariablesFromFunctionData(functionData),
// 			functionNames,
// 			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
// 		};
// 		return data;
// 	}
// 	override load(data: PersistedConfigBaseJsData) {
// 		const assemblerController = this.node.assemblerController();
// 		if (assemblerController) {
// 			return;
// 		}

// 		const {functionBody, variableNames, functionNames, serializedParamConfigs} = data;

// 		const functionData: FunctionData = {
// 			functionBody: functionBody,
// 			variableNames,
// 			variablesByName:variablesByNameFromPersistedConfigData(data),
// 			functionNames,
// 			functionsByName:functionsByNameFromPersistedConfigData(data,this.node),
// 			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
// 		};
// 		this.node.updateFromFunctionData(functionData);
// 	}
// }
