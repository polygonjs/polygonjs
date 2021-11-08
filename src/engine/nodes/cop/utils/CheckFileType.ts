import {ParamConfig} from '../../utils/params/ParamsConfig';
import {Constructor} from '../../../../types/GlobalTypes';

export function FileTypeCheckCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param check url extension */
		checkFileType = ParamConfig.BOOLEAN(true);
	};
}
