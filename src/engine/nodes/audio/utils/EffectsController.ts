import {BaseNodeType} from '../../_Base';

type Callback = (node: BaseNodeType) => void;

export function effectParamsOptions(callback: Callback) {
	return {
		cook: false,
		callback: callback,
	};
}
