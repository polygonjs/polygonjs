/**
 * get a texture
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	// ReturnValueTypeByJsConnectionPointType,
} from '../utils/io/connections/Js';
import {NodeContext} from '../../poly/NodeContext';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
class GetTextureJsParamsConfig extends NodeParamsConfig {
	/** @param the texture node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
		},
		dependentOnFoundNode: false,
		computeOnDirty: true,
	});
}
const ParamsConfig = new GetTextureJsParamsConfig();

export class GetTextureJsNode extends TypedJsNode<GetTextureJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getTexture';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TEXTURE, JsConnectionPointType.TEXTURE),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const node = this.pv.node.node();
		if (!(node && node.context() == NodeContext.COP)) {
			return;
		}
		const nodePath = `'${node.path()}'`;
		const varName = this.jsVarName(JsConnectionPointType.TEXTURE);
		const func = Poly.namedFunctionsRegister.getFunction('getTexture', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.TEXTURE,
				varName,
				value: func.asString(nodePath),
			},
		]);
	}
}
