import {NamedFunction1} from './_Base';
import {getOrCreateParamRef, _dummyReadParamRefVal} from '../../core/reactivity/ParamReactivity';

export class getActorNodeParamValue extends NamedFunction1<[string]> {
	static override type() {
		return 'getActorNodeParamValue';
	}
	func(paramName: string) {
		const functionNode = this.functionNode;
		if (!functionNode) {
			return;
		}
		const _ref = getOrCreateParamRef(functionNode, paramName);
		_dummyReadParamRefVal(_ref.value);
		return functionNode.params.get(paramName)!.value;
	}
}
