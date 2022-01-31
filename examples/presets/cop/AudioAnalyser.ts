import {AudioAnalyserCopNode} from '../../../src/engine/nodes/cop/AudioAnalyser';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const audioAnalyserCopNodePresetsCollectionFactory: PresetsCollectionFactory<AudioAnalyserCopNode> = (
	node: AudioAnalyserCopNode
) => {
	const normalised = new BasePreset()
		.addEntry<ParamType.VECTOR2>(node.p.rangeR, [0, 1])
		.addEntry<ParamType.VECTOR2>(node.p.rangeG, [0, 1])
		.addEntry<ParamType.VECTOR2>(node.p.rangeB, [0, 1])
		.addEntry<ParamType.VECTOR2>(node.p.rangeA, [0, 1]);
	const decibels = new BasePreset()
		.addEntry<ParamType.VECTOR2>(node.p.rangeR, [-200, 0])
		.addEntry<ParamType.VECTOR2>(node.p.rangeG, [-200, 0])
		.addEntry<ParamType.VECTOR2>(node.p.rangeB, [-200, 0])
		.addEntry<ParamType.VECTOR2>(node.p.rangeA, [-200, 0]);

	return new NodePresetsCollection().setPresets({normalised, decibels});
};
export const audioAnalyserCopPresetRegister: PresetRegister<typeof AudioAnalyserCopNode, AudioAnalyserCopNode> = {
	nodeClass: AudioAnalyserCopNode,
	setupFunc: audioAnalyserCopNodePresetsCollectionFactory,
};
