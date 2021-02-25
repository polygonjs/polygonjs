import {Constructor} from '../../../../types/GlobalTypes';
import {ParamConfig} from '../../utils/params/ParamsConfig';
export function AdvancedFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		advanced = ParamConfig.FOLDER(null);
	};
}
