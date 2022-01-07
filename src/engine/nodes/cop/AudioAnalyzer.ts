/**
 * Generates a AudioAnalyzer
 *
 *
 */
import {TypedCopNode} from './_Base';
import {DataTexture} from 'three/src/textures/DataTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {AUDIO_ANALYZER_NODES, NodeContext} from '../../poly/NodeContext';
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {ToneAudioNode} from 'tone/build/esm/core/context/ToneAudioNode';
import {ToneWithContextOptions} from 'tone/build/esm/core/context/ToneWithContext';
import {BooleanParam} from '../../params/Boolean';
import {NodePathParam} from '../../params/NodePath';
import {Vector2Param} from '../../params/Vector2';

interface ToneAudioByChannel {
	R?: ToneAudioNode<ToneWithContextOptions>;
	G?: ToneAudioNode<ToneWithContextOptions>;
	B?: ToneAudioNode<ToneWithContextOptions>;
	A?: ToneAudioNode<ToneWithContextOptions>;
}
interface ParamSet {
	active: BooleanParam;
	node: NodePathParam;
	range: Vector2Param;
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

class AudioAnalyzerCopParamsConfig extends NodeParamsConfig {
	/** @param if off, the texture will not be updated */
	activeR = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the RED channel */
	audioNodeR = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYZER_NODES,
		},
		visibleIf: {activeR: 1},
	});
	/** @param decibel range */
	rangeR = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeR: 1},
	});

	/** @param if off, the texture will not be updated */
	activeG = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the GREEN channel */
	audioNodeG = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYZER_NODES,
		},
		visibleIf: {activeG: 1},
	});
	/** @param decibel range */
	rangeG = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeG: 1},
	});

	/** @param if off, the texture will not be updated */
	activeB = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the BLUE channel */
	audioNodeB = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYZER_NODES,
		},
		visibleIf: {activeB: 1},
	});
	/** @param decibel range */
	rangeB = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeB: 1},
	});

	/** @param if off, the texture will not be updated */
	activeA = ParamConfig.BOOLEAN(0);
	/** @param audio node to read data from, into the ALPHA channel */
	audioNodeA = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYZER_NODES,
		},
		visibleIf: {activeA: 1},
	});
	/** @param decibel range */
	rangeA = ParamConfig.VECTOR2([-100, 100], {
		visibleIf: {activeA: 1},
	});

	/** @param update */
	update = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			AudioAnalyzerCopNode.PARAM_CALLBACK_update(node as AudioAnalyzerCopNode);
		},
	});
}
const ParamsConfig = new AudioAnalyzerCopParamsConfig();

export class AudioAnalyzerCopNode extends TypedCopNode<AudioAnalyzerCopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'audioAnalyzer';
	}

	async cook() {
		this._initParamsByChannel();
		await this._getAudioNodes();
		this._registerOnTickHook();
		await this._updateTexture();
	}

	dispose() {
		this._unRegisterOnTickHook();
	}

	private _toneAudioNodeByChannel: ToneAudioByChannel = {};
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
			this.states.error.set('no audio analyzer node found');
			this.cookController.endCook();
			return;
		}

		const container = await audioNode.compute();
		const audioBuilder = container.coreContent();
		if (!audioBuilder) {
			this.states.error.set('audio node invalid');
			this.cookController.endCook();
			return;
		}
		this._toneAudioNodeByChannel[channel] = audioBuilder.audioNode();
	}

	private _updateTexture() {
		if (!this._paramSetByChannel) {
			return;
		}

		this._updateTextureChannel('R', this._paramSetByChannel['R']);
		this._updateTextureChannel('G', this._paramSetByChannel['G']);
		this._updateTextureChannel('B', this._paramSetByChannel['B']);
		this._updateTextureChannel('A', this._paramSetByChannel['A']);
	}
	private async _updateTextureChannel(channel: Channel, paramSet: ParamSet) {
		const audioNode = this._toneAudioNodeByChannel[channel];
		if (!audioNode) {
			return;
		}
		if (!isBooleanTrue(paramSet.active.value)) {
			return;
		}
		const value = (audioNode as any).getValue();
		const values: number[] = CoreType.isNumber(value) ? [value] : value;

		const w = values.length;
		const h = 1;
		this._dataTexture = this._dataTexture || this._createDataTexture(w, h);

		const offset = OFFSET_BY_CHANNEL[channel];
		const pixelsCount = h * w;

		const min = paramSet.range.x.value;
		const max = paramSet.range.y.value;
		const data = this._dataTexture.image.data;
		for (let i = 0; i < pixelsCount; i++) {
			const normalized = (values[i] - min) / (max - min);
			const clamped = Math.max(0, Math.min(1, normalized));
			const v = clamped * 255;
			data[i * 4 + offset] = v;
		}
		this._dataTexture.needsUpdate = true;

		this.setTexture(this._dataTexture);
	}
	private _dataTexture: DataTexture | undefined;
	private _createDataTexture(width: number, height: number) {
		const size = width * height * 4;
		const pixelBuffer = new Uint8Array(size);
		pixelBuffer.fill(0);
		return new DataTexture(pixelBuffer, width, height);
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
			},
			G: {
				active: this.p.activeG,
				node: this.p.audioNodeG,
				range: this.p.rangeG,
			},
			B: {
				active: this.p.activeB,
				node: this.p.audioNodeB,
				range: this.p.rangeB,
			},
			A: {
				active: this.p.activeA,
				node: this.p.audioNodeA,
				range: this.p.rangeA,
			},
		};
	}

	/*
	 * PARAM CALLBACK
	 */
	static PARAM_CALLBACK_update(node: AudioAnalyzerCopNode) {
		node._updateTexture();
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
		return `cop/audioAnalyzerNode-${this.graphNodeId()}`;
	}
}
