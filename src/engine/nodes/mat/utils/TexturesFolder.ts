import {Constructor} from '../../../../types/GlobalTypes';
import {ParamConfig} from '../../utils/params/ParamsConfig';
export function TexturesFolderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		textures = ParamConfig.FOLDER(null);
	};
}
