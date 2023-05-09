/**
 * get a video property
 *
 *
 */

import {TypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum GetVideoPropertyJsNodeOutputName {
	currentTime = 'currentTime',
	duration = 'duration',
	playing = 'playing',
	muted = 'muted',
}
class GetVideoPropertyJsParamsConfig extends NodeParamsConfig {
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.COP,
			types: [CopType.VIDEO],
		},
		computeOnDirty: true,
	});
}
const ParamsConfig = new GetVideoPropertyJsParamsConfig();

export class GetVideoPropertyJsNode extends TypedJsNode<GetVideoPropertyJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getVideoProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetVideoPropertyJsNodeOutputName.currentTime, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(GetVideoPropertyJsNodeOutputName.duration, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(GetVideoPropertyJsNodeOutputName.playing, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(GetVideoPropertyJsNodeOutputName.muted, JsConnectionPointType.BOOLEAN),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();

		const node = this.pv.node.node();
		if (!(node && node.context() == NodeContext.COP)) {
			return;
		}
		const nodePath = `'${node.path()}'`;

		const _f = (
			propertyName: GetVideoPropertyJsNodeOutputName,
			functionName:
				| 'getVideoPropertyCurrentTime'
				| 'getVideoPropertyDuration'
				| 'getVideoPropertyPlaying'
				| 'getVideoPropertyMuted',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName: this.jsVarName(propertyName),
					value: func.asString(nodePath),
				},
			]);
		};

		_f(GetVideoPropertyJsNodeOutputName.currentTime, 'getVideoPropertyCurrentTime', JsConnectionPointType.FLOAT);
		_f(GetVideoPropertyJsNodeOutputName.duration, 'getVideoPropertyDuration', JsConnectionPointType.FLOAT);
		_f(GetVideoPropertyJsNodeOutputName.playing, 'getVideoPropertyPlaying', JsConnectionPointType.BOOLEAN);
		_f(GetVideoPropertyJsNodeOutputName.muted, 'getVideoPropertyMuted', JsConnectionPointType.BOOLEAN);
	}
}
