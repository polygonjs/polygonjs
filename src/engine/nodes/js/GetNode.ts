/**
 * Get a node
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodePathParam} from '../../params/NodePath';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {NodeContext} from '../../poly/NodeContext';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetNodeJsParamsConfig extends NodeParamsConfig {
	/** @param parameter to get */
	Node = ParamConfig.NODE_PATH('', {
		dependentOnFoundNode: false,
		nodeSelection: {
			context: NodeContext.SOP,
		},
		computeOnDirty: false,
	});
}
const ParamsConfig = new GetNodeJsParamsConfig();

export class GetNodeJsNode extends TypedJsNode<GetNodeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GET_NODE;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.NODE, JsConnectionPointType.NODE, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames([JsConnectionPointType.NODE]);
	}

	setNodePath(nodePath: string) {
		this.p.Node.set(nodePath);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const out = this.jsVarName(JsConnectionPointType.NODE);

		const node = (this.params.get(JsConnectionPointType.NODE) as NodePathParam).value.node();
		if (!node) {
			return;
		}

		const func = Poly.namedFunctionsRegister.getFunction('getNode', this, linesController);
		const bodyLine = func.asString(`'${node.path()}'`);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.NODE, varName: out, value: bodyLine},
		]);
	}
}
