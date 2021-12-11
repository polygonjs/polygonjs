import {CATEGORY_AUDIO} from './Category';

import {ChorusAudioNode} from '../../../nodes/audio/Chorus';
import {EnvelopeAudioNode} from '../../../nodes/audio/Envelope';
import {FileAudioNode} from '../../../nodes/audio/File';
import {MonoSynthAudioNode} from '../../../nodes/audio/MonoSynth';
import {NullAudioNode} from '../../../nodes/audio/Null';
import {PitchShiftAudioNode} from '../../../nodes/audio/PitchShift';
import {PlayInstrumentAudioNode} from '../../../nodes/audio/PlayInstrument';
import {PlaySourceAudioNode} from '../../../nodes/audio/PlaySource';
// import {OscillatorAudioNode} from '../../../nodes/audio/Oscillator';
import {ReverbAudioNode} from '../../../nodes/audio/Reverb';
import {SwitchAudioNode} from '../../../nodes/audio/Switch';
import {SynthAudioNode} from '../../../nodes/audio/Synth';
import {ToDestinationAudioNode} from '../../../nodes/audio/ToDestination';
import {VolumeAudioNode} from '../../../nodes/audio/Volume';

export interface AudioNodeChildrenMap {
	chorus: ChorusAudioNode;
	envelope: EnvelopeAudioNode;
	file: FileAudioNode;
	monoSynth: MonoSynthAudioNode;
	null: NullAudioNode;
	pitchShift: PitchShiftAudioNode;
	playInstrument: PlayInstrumentAudioNode;
	playSource: PlaySourceAudioNode;
	// oscillator: OscillatorAudioNode;
	reverb: ReverbAudioNode;
	synth: SynthAudioNode;
	switch: SwitchAudioNode;
	toDestination: ToDestinationAudioNode;
	volume: VolumeAudioNode;
}

import {PolyEngine} from '../../../Poly';
export class AudioRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(ChorusAudioNode, CATEGORY_AUDIO.EFFECTS);
		poly.registerNode(EnvelopeAudioNode, CATEGORY_AUDIO.MISC);
		poly.registerNode(FileAudioNode, CATEGORY_AUDIO.INPUTS);
		poly.registerNode(MonoSynthAudioNode, CATEGORY_AUDIO.INSTRUMENTS);
		poly.registerNode(NullAudioNode, CATEGORY_AUDIO.MISC);
		poly.registerNode(PitchShiftAudioNode, CATEGORY_AUDIO.EFFECTS);
		poly.registerNode(PlayInstrumentAudioNode, CATEGORY_AUDIO.MISC);
		poly.registerNode(PlaySourceAudioNode, CATEGORY_AUDIO.MISC);
		// poly.registerNode(OscillatorAudioNode, CATEGORY_AUDIO.MISC);
		poly.registerNode(ReverbAudioNode, CATEGORY_AUDIO.EFFECTS);
		poly.registerNode(SwitchAudioNode, CATEGORY_AUDIO.MISC);
		poly.registerNode(SynthAudioNode, CATEGORY_AUDIO.INSTRUMENTS);
		poly.registerNode(ToDestinationAudioNode, CATEGORY_AUDIO.EFFECTS);
		poly.registerNode(VolumeAudioNode, CATEGORY_AUDIO.MISC);
	}
}
