/**
 * cooks a node
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class CookNodeJsParamsConfig extends NodeParamsConfig {
	/** @param  node to cook */
	node = ParamConfig.NODE_PATH('', {
		dependentOnFoundNode: false,
		computeOnDirty: true,
	});
}
const ParamsConfig = new CookNodeJsParamsConfig();

export class CookNodeJsNode extends TypedJsNode<CookNodeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'cookNode';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		// const node = this.variableForInputParam(shadersCollectionController, this.p.node);
		const node = this.pv.node.node();
		if (!node) {
			return;
		}
		const nodePath = `'${node.path()}'`;

		const func = Poly.namedFunctionsRegister.getFunction('cookNode', this, shadersCollectionController);
		const bodyLine = func.asString(nodePath);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
