import {NodeParamsConfig, ParamTemplate} from '../params/ParamsConfig';
import {PolyNodeDefinition} from './PolyNodeDefinition';

export class PolyNodeParamsConfig {
	static ParamsConfig(data: PolyNodeDefinition) {
		const paramsConfig = new NodeParamsConfig();
		if (data.params) {
			for (let paramData of data.params) {
				const paramName = paramData.name;
				const paramType = paramData.type;
				const initValue = paramData.initValue;
				const options = paramData.options;
				(paramsConfig as any)[paramName] = new ParamTemplate(paramType, initValue, options); //ParamConfig.STRING('aa');
			}
		}
		return paramsConfig;
	}
}
