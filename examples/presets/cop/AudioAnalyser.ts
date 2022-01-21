import {AudioAnalyserCopNode} from '../../../src/engine/nodes/cop/AudioAnalyser';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const audioAnalyserCopNodePresetsCollectionFactory: PresetsCollectionFactory<AudioAnalyserCopNode> = (
	node: AudioAnalyserCopNode
) => {
	const fft_meter_waveform = new BasePreset()
		.addEntry<ParamType.VECTOR2>(node.p.rangeR, [-160, 0])
		.addEntry<ParamType.VECTOR2>(node.p.rangeG, [-100, 100])
		.addEntry<ParamType.VECTOR2>(node.p.rangeB, [-0.05, 0.05]);

	return new NodePresetsCollection().setPresets({fft_meter_waveform});
};
export const audioAnalyserCopPresetRegister: PresetRegister<typeof AudioAnalyserCopNode, AudioAnalyserCopNode> = {
	nodeClass: AudioAnalyserCopNode,
	setupFunc: audioAnalyserCopNodePresetsCollectionFactory,
};
