import {Constructor} from '../../../../types/GlobalTypes';
import {ParamConfig} from '../../utils/params/ParamsConfig';
export function DefaultFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		default = ParamConfig.FOLDER(null);
	};
}
