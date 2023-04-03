/**
 * get a material
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeContext} from '../../poly/NodeContext';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
class GetMaterialJsParamsConfig extends NodeParamsConfig {
	/** @param the material node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		dependentOnFoundNode: false,
		computeOnDirty: true,
	});
}
const ParamsConfig = new GetMaterialJsParamsConfig();

export class GetMaterialJsNode extends TypedJsNode<GetMaterialJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getMaterial';
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const node = this.pv.node.node();
		if (!(node && node.context() == NodeContext.MAT)) {
			return;
		}
		const nodePath = `'${node.path()}'`;
		const varName = this.jsVarName(JsConnectionPointType.MATERIAL);
		const func = Poly.namedFunctionsRegister.getFunction('getMaterial', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.MATERIAL,
				varName,
				value: func.asString(nodePath),
			},
		]);
	}
}
