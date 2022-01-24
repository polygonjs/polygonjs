/**
 * Generates a texture from audio analyse nodes, such as [FFT](/docs/nodes/audio/FFT), [Meter](/docs/nodes/audio/meter) and [Waveform](/docs/nodes/audio/waveform).
 *
 *
 */
import {TypedCopNode} from './_Base';
import {DataTexture} from 'three/src/textures/DataTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AUDIO_ANALYSER_NODES, NodeContext} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/Type';
import {BooleanParam} from '../../params/Boolean';
import {NodePathParam} from '../../params/NodePath';
import {Vector2Param} from '../../params/Vector2';
import {BaseAnalyserAudioNode} from '../audio/_BaseAnalyser';
import {NearestFilter} from 'three/src/constants';
import {FloatParam} from '../../params/Float';

interface ToneAudioByChannel {
	R?: BaseAnalyserAudioNode<any>;
	G?: BaseAnalyserAudioNode<any>;
	B?: BaseAnalyserAudioNode<any>;
	A?: BaseAnalyserAudioNode<any>;
}
interface ParamSet {
	active: BooleanParam;
	node: NodePathParam;
	range: Vector2Param;
	speedMult: FloatParam;
}
interface ParamSetByChannel {
	R: ParamSet;
	G: ParamSet;
	B: ParamSet;
	A: ParamSet;
}
type Channel = keyof ParamSetByChannel;
const OFFSET_BY_CHANNEL = {
	R: 0,
	G: 1,
	B: 2,
	A: 3,
};
type AnalyserValues = number[] | Float32Array;
interface ValuesByChannel {
	R?: AnalyserValues;
	G?: AnalyserValues;
	B?: AnalyserValues;
	A?: AnalyserValues;
}
const CHANNELS: Channel[] = ['R', 'G', 'B', 'A'];

const TEXTURE_ROWS = 2;
const BYTE_SIZE = 255;
const HALF_BYTE_SIZE = Math.floor(BYTE_SIZE * 0.5);
const DEFAULT_SPEED = 0.04;
class AudioAnalyserCopParamsConfig extends NodeParamsConfig {
	/** @param if off, the texture will not be updated */
	activeR = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the RED channel */
	audioNodeR = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {activeR: 1},
	});
	/** @param decibel range */
	rangeR = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeR: 1},
	});
	/** @param speed mult */
	speedMultR = ParamConfig.FLOAT(DEFAULT_SPEED, {
		visibleIf: {activeR: 1},
		separatorAfter: true,
	});

	/** @param if off, the texture will not be updated */
	activeG = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the GREEN channel */
	audioNodeG = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {activeG: 1},
	});
	/** @param decibel range */
	rangeG = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeG: 1},
	});
	/** @param speed mult */
	speedMultG = ParamConfig.FLOAT(DEFAULT_SPEED, {
		visibleIf: {activeG: 1},
		separatorAfter: true,
	});

	/** @param if off, the texture will not be updated */
	activeB = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the BLUE channel */
	audioNodeB = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {activeB: 1},
	});
	/** @param decibel range */
	rangeB = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeB: 1},
	});
	/** @param speed mult */
	speedMultB = ParamConfig.FLOAT(DEFAULT_SPEED, {
		visibleIf: {activeB: 1},
		separatorAfter: true,
	});

	/** @param if off, the texture will not be updated */
	activeA = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the ALPHA channel */
	audioNodeA = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {activeA: 1},
	});
	/** @param decibel range */
	rangeA = ParamConfig.VECTOR2([0, 1], {
		visibleIf: {activeA: 1},
	});
	/** @param speed mult */
	speedMultA = ParamConfig.FLOAT(DEFAULT_SPEED, {
		visibleIf: {activeA: 1},
		separatorAfter: true,
	});
}
const ParamsConfig = new AudioAnalyserCopParamsConfig();

export class AudioAnalyserCopNode extends TypedCopNode<AudioAnalyserCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'audioAnalyser';
	}

	override async cook() {
		this._initParamsByChannel();
		await this._getAudioNodes();
		this._registerOnTickHook();
		this._updateTexture(1);

		this.cookController.endCook();
	}

	override dispose() {
		super.dispose();
		this._unRegisterOnTickHook();
	}

	private _audioNodesByChannel: ToneAudioByChannel = {};
	private _valuesByChannel: ValuesByChannel = {};
	private async _getAudioNodes() {
		const promises = [
			this._getAudioNode('R'),
			this._getAudioNode('G'),
			this._getAudioNode('B'),
			this._getAudioNode('A'),
		];
		await Promise.all(promises);
	}
	private async _getAudioNode(channel: Channel) {
		if (!this._paramSetByChannel) {
			return;
		}
		const paramSet = this._paramSetByChannel[channel];
		if (!isBooleanTrue(paramSet.active.value)) {
			return;
		}
		const nodeParam = paramSet.node;
		const audioNode = nodeParam.value.nodeWithContext(NodeContext.AUDIO);
		if (!audioNode) {
			this.states.error.set('no audio analyser node found');
			this.cookController.endCook();
			return;
		}
		const audioAnalyserNode = audioNode as BaseAnalyserAudioNode<any>;
		if (!audioAnalyserNode.getAnalyserValue) {
			return;
		}

		await audioNode.compute();
		this._audioNodesByChannel[channel] = audioAnalyserNode;
	}

	private _updateTexture(delta: number) {
		if (!this._paramSetByChannel) {
			return;
		}

		let maxSize = -1;
		for (let channel of CHANNELS) {
			const values = this._valuesForChannel(channel, this._paramSetByChannel[channel]);

			this._valuesByChannel[channel] = values;
			if (values) {
				const size = values.length;
				if (maxSize < size) {
					maxSize = size;
				}
			}
		}

		if (!this._dataTexture) {
			this._createDataTexture(maxSize);
		} else {
			if (this._dataTexture.image.width != maxSize) {
				// regenerate a texture if size is different
				this._createDataTexture(maxSize);
			}
		}
		if (!this._dataTexture) {
			return;
		}

		for (let channel of CHANNELS) {
			const values = this._valuesByChannel[channel];
			if (values) {
				this._updateTextureChannel(channel, this._paramSetByChannel[channel], values, this._dataTexture, delta);
			}
		}
	}
	private _valuesForChannel(channel: Channel, paramSet: ParamSet) {
		const audioNode = this._audioNodesByChannel[channel];
		if (!audioNode) {
			return;
		}
		if (!isBooleanTrue(paramSet.active.value)) {
			return;
		}
		const values = audioNode.getAnalyserValue();
		return values;
	}
	private async _updateTextureChannel(
		channel: Channel,
		paramSet: ParamSet,
		values: AnalyserValues,
		texture: DataTexture,
		delta: number
	) {
		if (!this._dataTexture) {
			return;
		}
		const columns = this._dataTexture.image.width;

		const offset = OFFSET_BY_CHANNEL[channel];

		const min = paramSet.range.x.value;
		const max = paramSet.range.y.value;
		const data = texture.image.data;

		const row2Offset = columns * 4;
		const speedMult = paramSet.speedMult.value;
		for (let i = 0; i < columns; i++) {
			const normalized = (values[i] - min) / (max - min);
			const clamped = Math.max(0, Math.min(1, normalized));
			const v = clamped * BYTE_SIZE;
			const arrayIndex = i * 4 + offset;
			const prevValue = data[arrayIndex];
			data[arrayIndex] = v;
			const speed = (speedMult * (v - prevValue)) / delta;
			data[row2Offset + arrayIndex] = HALF_BYTE_SIZE + speed;
		}
		texture.needsUpdate = true;
	}
	private _dataTexture: DataTexture | undefined;
	private _createDataTexture(valuesSize: number) {
		if (valuesSize <= 0) {
			return;
		}
		const height = TEXTURE_ROWS;
		const width = valuesSize;
		const size = width * height * 4;
		const pixelBuffer = new Uint8Array(size);
		pixelBuffer.fill(0);
		// file alpha to 1
		// so that this can be set as a color texture without the material becoming transparent
		for (let i = 0; i < size; i++) {
			pixelBuffer[i * 4 + 3] = BYTE_SIZE;
		}
		const texture = new DataTexture(pixelBuffer, width, height);
		texture.minFilter = NearestFilter;
		texture.magFilter = NearestFilter;
		this._dataTexture = texture;
		this.setTexture(this._dataTexture);
	}

	/*
	 * INIT
	 */
	private _paramSetByChannel: ParamSetByChannel | undefined;
	private _initParamsByChannel() {
		this._paramSetByChannel = this._paramSetByChannel || {
			R: {
				active: this.p.activeR,
				node: this.p.audioNodeR,
				range: this.p.rangeR,
				speedMult: this.p.speedMultR,
			},
			G: {
				active: this.p.activeG,
				node: this.p.audioNodeG,
				range: this.p.rangeG,
				speedMult: this.p.speedMultG,
			},
			B: {
				active: this.p.activeB,
				node: this.p.audioNodeB,
				range: this.p.rangeB,
				speedMult: this.p.speedMultB,
			},
			A: {
				active: this.p.activeA,
				node: this.p.audioNodeA,
				range: this.p.rangeA,
				speedMult: this.p.speedMultA,
			},
		};
	}

	/*
	 * REGISTER TICK CALLBACK
	 */
	private async _registerOnTickHook() {
		if (this.scene().registeredBeforeTickCallbacks().has(this._tickCallbackName())) {
			return;
		}
		this.scene().registerOnBeforeTick(this._tickCallbackName(), this._updateTexture.bind(this));
	}
	private async _unRegisterOnTickHook() {
		this.scene().unRegisterOnBeforeTick(this._tickCallbackName());
	}
	private _tickCallbackName() {
		return `cop/audioAnalyserNode-${this.graphNodeId()}`;
	}
}
