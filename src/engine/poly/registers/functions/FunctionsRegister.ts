import {ShadersCollectionController} from '../../../nodes/js/code/utils/ShadersCollectionController';
import {BaseJsNodeType} from '../../../nodes/js/_Base';
import {NamedFunctionMap} from './All';
import {BaseNamedFunctionRegister} from './_BaseRegister';

export class NamedFunctionRegister extends BaseNamedFunctionRegister {
	getFunction<K extends keyof NamedFunctionMap>(
		functionName: K,
		node: BaseJsNodeType,
		shadersCollectionController: ShadersCollectionController
	): NamedFunctionMap[K] {
		const funcClass = this._functionByName.get(functionName);
		if (!funcClass) {
			console.error(`function not registered:'${functionName}'`);
		}
		const func = new (funcClass as any)(node, shadersCollectionController);
		return func;
		// return func as unknown as NamedFunctionMap[K];
	}
}
