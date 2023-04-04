import {BasePersistedConfig, PersistedConfigWithShaders} from '../../../../utils/BasePersistedConfig';
import {FunctionData} from '../_Base';
import {
	RegisterableVariable,
	SerializedVariable,
	SerializedVariableType,
	isVariableSerializable,
	serializeVariable,
	deserializeVariable,
} from '../_BaseJsPersistedConfigUtils';
import {SDFBuilderSopNode} from '../../../../sop/SDFBuilder';
import {Poly} from '../../../../../Poly';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {JsParamConfig, JsParamConfigJSON} from '../../utils/JsParamConfig';
import {ParamType} from '../../../../../poly/ParamType';

export interface PersistedConfigBaseSDFData extends PersistedConfigWithShaders {
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
	override async toData(): Promise<PersistedConfigBaseSDFData | undefined> {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}
		const functionData = this.node.functionData();
		if (!functionData) {
			return;
		}
		const {functionBody, variableNames, variablesByName, functionNames, paramConfigs} = functionData;

		const serializedVariables: SerializedVariable<SerializedVariableType>[] = [];
		for (let variableName of variableNames) {
			const variable = variablesByName[variableName];
			if (variable != null && isVariableSerializable(variable)) {
				const serialized = serializeVariable(variable);
				serializedVariables.push(serialized);
			}
		}

		const data: PersistedConfigBaseSDFData = {
			functionBody,
			variableNames,
			variables: serializedVariables,
			functionNames,
			serializedParamConfigs: paramConfigs.map((p) => p.toJSON()),
		};
		return data;
	}
	override load(data: PersistedConfigBaseSDFData) {
		const assemblerController = this.node.assemblerController();
		if (assemblerController) {
			return;
		}

		const {functionBody, variableNames, variables, functionNames, serializedParamConfigs} = data;

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

		const functionData: FunctionData = {
			functionBody: functionBody,
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			paramConfigs: serializedParamConfigs.map((json) => JsParamConfig.fromJSON(json)),
		};
		this.node.updateFromFunctionData(functionData);
	}
}
