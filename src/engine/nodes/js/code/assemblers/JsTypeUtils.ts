import {JsConnectionPointType} from '../../../utils/io/connections/Js';

export function jsFunctionName(prefix: string, type: JsConnectionPointType): string {
	return `${prefix}_${type}`.replace('[]', '_Array');
}
export function sanitizeJsVarName(varName: string): string {
	return varName.replace(/\[\]$/g, '');
}
