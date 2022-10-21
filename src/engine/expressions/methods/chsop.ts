/**
 * Returns the value of another nodePath or nodeParam parameter
 *
 *
 * @remarks
 * It takes 1 argument, the path to the parameter.
 *
 * chsop(<param_path\>)
 *
 * - **<param_path\>** is a string, which can be the absolute or relative path
 *
 * ## Usage
 *
 * - `chsop('./material1/material')` - returns the value of the parameter material of node ./material1
 *
 */
import {CoreType} from './../../../core/Type';
import {BaseMethodFindDependencyArgs} from './_Base';
import {TypedParamPathParamValue, TypedNodePathParamValue} from './../../../core/Walker';
import {BaseMethod} from './_Base';
import {DecomposedPath} from '../../../core/DecomposedPath';
import {MethodDependency} from '../MethodDependency';
import {BaseParamType} from '../../params/_Base';

export class ChsopExpression extends BaseMethod {
	protected override _requireDependency = true;

	static override requiredArguments() {
		return [['string', 'path to param']];
	}

	private _referencedParam: BaseParamType | undefined;
	override findDependency(args: BaseMethodFindDependencyArgs): MethodDependency | null {
		const {indexOrPath} = args;
		if (indexOrPath == null) {
			return null;
		}
		if (!CoreType.isString(indexOrPath)) {
			return null;
		}
		const decomposedPath = new DecomposedPath();
		const param = this.getReferencedParam(indexOrPath, decomposedPath);
		if (param) {
			// TODO: consider using this dependency optimization in other expression methods
			this._referencedParam = param;
			return this.createDependency(param, {indexOrPath}, decomposedPath);
		}
		return null;
	}

	override async processArguments(args: any[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			let val: any = 0;
			if (args.length == 1) {
				const path = args[0];
				const ref = this._referencedParam || this.getReferencedParam(path);
				if (ref) {
					if (ref.isDirty()) {
						await ref.compute();
					}
					const paramValue = ref.value;
					if (
						paramValue instanceof TypedParamPathParamValue ||
						paramValue instanceof TypedNodePathParamValue
					) {
						const result = paramValue.graphNodePath();
						if (result != null) {
							val = result;
							resolve(val);
						}
					}
				} else {
					reject('');
				}
			}
		});
	}
}
