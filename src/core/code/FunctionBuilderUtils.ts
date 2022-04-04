import {Constructor, PolyDictionary} from '../../types/GlobalTypes';
import * as THREE from 'three'; // three import required to give to the function builder
import {BaseNodeType} from '../../engine/nodes/_Base';

export class BaseCodeProcessor {
	constructor(protected node: BaseNodeType) {}
}

export function buildCodeNodeFunction<T extends BaseCodeProcessor>(
	BaseCodeProcessor: Constructor<T>,
	BaseCodeProcessorName: string,
	functionBody: string,
	otherVariables: PolyDictionary<any> = {}
) {
	const availableVariables: PolyDictionary<any> = {
		[BaseCodeProcessorName]: BaseCodeProcessor,
		...THREE,
	};
	const variableNames = Object.keys(availableVariables).concat(Object.keys(otherVariables));
	const sortedVariables = variableNames.map((varName) => {
		let varValue = availableVariables[varName];
		if (varValue == null) {
			varValue = otherVariables[varName];
		}
		return varValue;
	});
	const processorCreatorFunction = new Function(...variableNames, functionBody);
	const ProcessorClass: typeof BaseCodeProcessor | undefined = processorCreatorFunction(...sortedVariables);
	return ProcessorClass;
}
