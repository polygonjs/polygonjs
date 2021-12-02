/**
 * Can create a texture from a snapshot of a COP/video or COP/webcam
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {VideoTexture} from 'three/src/textures/VideoTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController} from './utils/TextureParamsController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Texture} from 'three/src/textures/Texture';
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
	paramsConfig = ParamsConfig;
	static type() {
		return CopType.SNAPSHOT;
	}

	static displayedInputNames(): string[] {
		return ['input to take a snapshot of'];
	}
	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	async cook(inputTextures: Texture[]) {
		const inputTexture = inputTextures[0];

		if (inputTexture && inputTexture instanceof VideoTexture) {
			const texture = await this._canvasToTexture(inputTexture);
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

		const canvasElement = document.createElement('canvas');
		// videoWidth and videoHeight are more robust than .width and .height (see https://discourse.threejs.org/t/how-to-get-camera-video-texture-size-or-resolution/2879)
		canvasElement.width = inputTexture.image.videoWidth;
		canvasElement.height = inputTexture.image.videoHeight;
		const canvasCtx = canvasElement.getContext('2d')!;
		canvasCtx.drawImage(inputTexture.image, 0, 0, canvasElement.width, canvasElement.height);
		return canvasElement;
	}
	private _canvas: HTMLCanvasElement | undefined;
	private _canvasToTexture(inputTexture: VideoTexture): Promise<Texture> | void {
		const prevCanvas = this._canvas;
		let newTextureRequired = true;
		const newCanvas = this._videoSnapshotCanvas(inputTexture);
		if (!newCanvas) {
			return;
		}
		if (prevCanvas) {
			if (newCanvas.width == prevCanvas.width && newCanvas.height == prevCanvas.height) {
				newTextureRequired = false;
			}
		}
		this._canvas = newCanvas;
		return new Promise((resolve) => {
			if (!this._canvas) {
				return;
			}
			const imgDataURL = this._canvas.toDataURL('image/png');
			const image = new Image();
			image.onload = () => {
				let newTexture: Texture | undefined;
				if (newTextureRequired) {
					newTexture = new Texture(image);
					newTexture.encoding = inputTexture.encoding;
				} else {
					newTexture = this.containerController.container().coreContent();
					newTexture.copy(inputTexture);
				}
				newTexture.needsUpdate = true;
				resolve(newTexture);
			};
			image.src = imgDataURL;
		});
	}
}
