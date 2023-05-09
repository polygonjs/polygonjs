import {Constructor, PolyDictionary} from '../../types/GlobalTypes';
import * as THREE from 'three'; // three import required to give to the function builder
import {BaseNodeType} from '../../engine/nodes/_Base';

export class BaseCodeProcessor {
	constructor(protected node: BaseNodeType) {}
}

interface BuildCodeNodeFunctionOptions<T extends BaseCodeProcessor> {
	BaseCodeProcessor: Constructor<T>;
	BaseCodeProcessorName: string;
	node: BaseNodeType;
	functionBody: string;
	otherVariables?: PolyDictionary<any>;
}

export function buildCodeNodeFunction<T extends BaseCodeProcessor>(options: BuildCodeNodeFunctionOptions<T>) {
	const {BaseCodeProcessor, BaseCodeProcessorName, node, functionBody, otherVariables} = options;

	const availableVariables: PolyDictionary<any> = {
		[BaseCodeProcessorName]: BaseCodeProcessor,
		...THREE,
		states: node.states,
	};
	const variableNames = Object.keys(availableVariables).concat(Object.keys(otherVariables || {}));
	const sortedVariables = variableNames.map((varName) => {
		let varValue = availableVariables[varName];
		if (varValue == null) {
			varValue = (otherVariables || {})[varName];
		}
		return varValue;
	});
	const processorCreatorFunction = new Function(...variableNames, functionBody);
	const ProcessorClass: typeof BaseCodeProcessor | undefined = processorCreatorFunction(...sortedVariables);
	return ProcessorClass;
}
