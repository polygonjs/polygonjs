/**
 * Can create a texture from a snapshot of a COP/video or COP/webcam
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {CanvasTexture, VideoTexture} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController} from './utils/TextureParamsController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Texture} from 'three';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {BaseNodeType} from '../_Base';
import {CoreDomUtils} from '../../../core/DomUtils';

export function SnapshotCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param capture */
		capture = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				SnapshotCopNode.PARAM_CALLBACK_snapshot(node as SnapshotCopNode);
			},
		});
	};
}

class SnapshotCopParamsConfig extends SnapshotCopParamConfig(NodeParamsConfig) {}

const ParamsConfig = new SnapshotCopParamsConfig();

export class SnapshotCopNode extends TypedCopNode<SnapshotCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.SNAPSHOT;
	}

	static override displayedInputNames(): string[] {
		return ['input to take a snapshot of'];
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputTextures: Texture[]) {
		const inputTexture = inputTextures[0];

		if (inputTexture && inputTexture instanceof VideoTexture) {
			const texture = this._videoSnapshotCanvas(inputTexture);
			if (texture) {
				TextureParamsController.copyTextureAttributes(texture, inputTexture);
				this.setTexture(texture);
				return;
			}
		} else {
			this.states.error.set('input texture is not a video');
		}
		this.cookController.endCook();
	}

	static PARAM_CALLBACK_snapshot(node: SnapshotCopNode) {
		node.paramCallbackSnapshot();
	}
	private paramCallbackSnapshot() {
		this.setDirty();
	}

	private _videoSnapshotCanvas(inputTexture: VideoTexture) {
		const videoElement = inputTexture.image as HTMLVideoElement;
		if (!CoreDomUtils.isHTMLVideoElementLoaded(videoElement)) {
			this.states.error.set('video not loaded');
			return;
		}

		this._canvas = this._canvas || document.createElement('canvas');
		this._canvasTexture = this._canvasTexture || new CanvasTexture(this._canvas);
		// videoWidth and videoHeight are more robust than .width and .height (see https://discourse.threejs.org/t/how-to-get-camera-video-texture-size-or-resolution/2879)
		this._canvas.width = inputTexture.image.videoWidth;
		this._canvas.height = inputTexture.image.videoHeight;
		const canvasCtx = this._canvas.getContext('2d')!;
		canvasCtx.drawImage(inputTexture.image, 0, 0, this._canvas.width, this._canvas.height);
		this._canvasTexture.needsUpdate = true;
		return this._canvasTexture;
	}
	private _canvas: HTMLCanvasElement | undefined;
	private _canvasTexture: CanvasTexture | undefined;
}
