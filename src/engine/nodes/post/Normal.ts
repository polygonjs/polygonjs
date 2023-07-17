/**
 * displays objects normals
 *
 *
 */
import {TypedPostNode, TypedPostNodeContext} from './_Base';
import {NormalPass} from 'postprocessing';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

class NormalParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NormalParamsConfig();
export class NormalPostNode extends TypedPostNode<NormalPass, NormalParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'normal';
	}

	override createPass(context: TypedPostNodeContext) {
		const normalPass = new NormalPass(context.scene, context.camera);

		return normalPass;
	}
}
