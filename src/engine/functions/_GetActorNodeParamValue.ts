import {NamedFunction1} from './_Base';
import {getOrCreateParamRef} from '../../core/reactivity/ParamReactivity';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';

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
		dummyReadRefVal(_ref.value);
		return functionNode.params.get(paramName)!.value;
	}
}
