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

class AudioAnalyzerCopParamsConfig extends NodeParamsConfig {
	/** @param audio node to read data from */
	audioAnalyzerNode = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYZER_NODES,
		},
	});
	/** @param decibel range */
	decibelRange = ParamConfig.VECTOR2([-100, 100]);
	/** @param if off, the texture will not be updated */
	active = ParamConfig.BOOLEAN(true);
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
	private _dataTexture: DataTexture | undefined;

	async cook() {
		await this._getAudioNode();
		this._registerOnTickHook();
		await this._updateTexture();
	}

	dispose() {
		this._unRegisterOnTickHook();
	}

	private _createDataTexture(width: number, height: number) {
		const pixel_buffer = this._createPixelBuffer(width, height);
		return new DataTexture(pixel_buffer, width, height);
	}
	private _createPixelBuffer(width: number, height: number) {
		const size = width * height * 4;

		return new Uint8Array(size);
	}

	private _toneAudioNode: ToneAudioNode<ToneWithContextOptions> | undefined;
	private async _getAudioNode() {
		const audioNode = this.pv.audioAnalyzerNode.nodeWithContext(NodeContext.AUDIO);
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
		this._toneAudioNode = audioBuilder.audioNode();
	}
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

	static PARAM_CALLBACK_update(node: AudioAnalyzerCopNode) {
		node._updateTexture();
	}
	private async _updateTexture() {
		if (!this._toneAudioNode) {
			return;
		}
		if (!isBooleanTrue(this.pv.active)) {
			return;
		}
		const value = (this._toneAudioNode as any).getValue();
		const values: number[] = CoreType.isNumber(value) ? [value] : value;

		const w = values.length;
		const h = 1;
		this._dataTexture = this._dataTexture || this._createDataTexture(w, h);

		const pixelsCount = h * w;

		const a = 255;
		const min = this.pv.decibelRange.x;
		const max = this.pv.decibelRange.y;
		const data = this._dataTexture.image.data;
		for (let i = 0; i < pixelsCount; i++) {
			const normalized = (values[i] - min) / (max - min);
			const clamped = Math.max(0, Math.min(1, normalized));
			const v = clamped * 255;
			data[i * 4 + 0] = v;
			data[i * 4 + 1] = v;
			data[i * 4 + 2] = v;
			data[i * 4 + 3] = a;
		}
		this._dataTexture.needsUpdate = true;

		this.setTexture(this._dataTexture);
	}
}
