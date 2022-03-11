import {BaseNodeType} from '../../_Base';

type AudioEffectsControllerCallback = (node: BaseNodeType) => void;

export function effectParamsOptions(callback: AudioEffectsControllerCallback) {
	return {
		cook: false,
		callback: callback,
	};
}
