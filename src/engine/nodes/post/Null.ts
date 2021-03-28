/**
 * Simly adds an empty pass.
 *
 * @remarks
 * If you need to refer to the end of a chain of POST nodes, you may want to use this node and refer to it. It is then easier to change this node inputs, rather than change what other nodes refer to.
 */
import {TypedPostProcessNode} from './_Base';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
class NullPostParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new NullPostParamsConfig();
export class NullPostNode extends TypedPostProcessNode<Pass, NullPostParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'null';
	}
}
