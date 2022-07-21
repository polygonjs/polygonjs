/**
 * allows to set up complex animations using keyframes
 *
 *
 */
import {Vector2} from 'three';
import {ChannelData, cubicBezierCurveFromKeyframes, getPointFromCurves} from './../../../core/animation/Keyframe';
import {StringParamLanguage} from './../../params/utils/OptionsController';
import {NodeParamsConfig, ParamConfig} from './../utils/params/ParamsConfig';
import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {CubicBezierCurve} from 'three';
import {ChannelsData} from '../../../core/animation/Keyframe';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
const tmp = new Vector2();

const INIT_DATA: ChannelsData = {
	depth: [
		{
			pos: 0,
			value: 0,
			tan: {x: 0, y: 1},
		},
		{
			pos: 0.2,
			value: 1,
			tan: {x: 1, y: 0},
		},
		{
			pos: 1,
			value: 0,
			tan: {x: 1, y: 0},
		},
	],
};

class KeyframesActorParamsConfig extends NodeParamsConfig {
	t = ParamConfig.FLOAT(0, {
		step: 0.001,
	});
	data = ParamConfig.STRING(JSON.stringify(INIT_DATA, null, 2), {
		language: StringParamLanguage.JSON,
	});
}
const ParamsConfig = new KeyframesActorParamsConfig();

export class KeyframesActorNode extends TypedActorNode<KeyframesActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'keyframes';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('t', ActorConnectionPointType.FLOAT, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('center', ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint('longitude', ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint('latitude', ActorConnectionPointType.FLOAT),
			new ActorConnectionPoint('depth', ActorConnectionPointType.FLOAT),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		this._buildCurvesIfRequired();
		const curves = this._curvesByChannelName.get(outputName);
		if (!curves) {
			console.warn(`no curve for output ${outputName}`);
			return -1;
		}
		const t = this._inputValueFromParam<ParamType.FLOAT>(this.p.t, context);
		let cachedValuesForOutput = this._valuesByTByChannelName.get(outputName);
		if (!cachedValuesForOutput) {
			cachedValuesForOutput = new Map();
			this._valuesByTByChannelName.set(outputName, cachedValuesForOutput);
		}
		let cachedValue = cachedValuesForOutput.get(t);
		if (cachedValue == null) {
			getPointFromCurves(t, curves, tmp);
			cachedValue = tmp.y;
			cachedValuesForOutput.set(t, cachedValue);
		}
		return cachedValue;
	}
	private _curvesByChannelName: Map<string, CubicBezierCurve[]> = new Map();
	private _valuesByTByChannelName: Map<string, Map<number, number>> = new Map();
	private _curvesBuiltWithData: string = '';
	private _buildCurvesIfRequired() {
		if (this._curvesBuiltWithData == this.pv.data) {
			return;
		}
		console.log('build curves');
		this._curvesByChannelName.clear();
		this._valuesByTByChannelName.clear();
		try {
			const data = JSON.parse(this.pv.data) as ChannelsData;
			const channelNames = Object.keys(data);
			for (let channelName of channelNames) {
				const channelData = data[channelName] as ChannelData;
				const curves = cubicBezierCurveFromKeyframes(channelData);
				this._curvesByChannelName.set(channelName, curves);
			}
		} catch (e) {
			this.states.error.set('failed to parse');
		}

		this._curvesBuiltWithData = this.pv.data;
	}
}
