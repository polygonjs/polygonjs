import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {TypedAudioNode} from './_Base';

export abstract class BaseAnalyserAudioNode<K extends NodeParamsConfig> extends TypedAudioNode<K> {
	abstract getAnalyserValue(): Float32Array | number[] | undefined;
}
