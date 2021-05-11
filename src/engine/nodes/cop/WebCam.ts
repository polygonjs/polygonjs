/**
 * Imports a video from your webcam
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {VideoTexture} from 'three/src/textures/VideoTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Texture} from 'three/src/textures/Texture';

export function WebCamCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param texture resolution */
		res = ParamConfig.VECTOR2([1024, 1024]);
	};
}
class WebCamCopParamsConfig extends TextureParamConfig(WebCamCopParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new WebCamCopParamsConfig();

export class WebCamCopNode extends TypedCopNode<WebCamCopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'webCam';
	}

	private _video: HTMLVideoElement | undefined;
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	static displayedInputNames(): string[] {
		return ['optional texture to copy attributes from'];
	}
	initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	async cook(input_contents: Texture[]) {
		if (this._video) {
			document.body.removeChild(this._video);
		}
		const video_element = '<video style="display:none" autoplay muted playsinline></video>';
		const video_container = document.createElement('div');
		video_container.innerHTML = video_element;
		this._video = video_container.children[0] as HTMLVideoElement;
		// this._video = document.createElement('video');
		// this._video.autoplay = true;
		// this._video.setAttribute('playsinline', 'true');
		// this._video.setAttribute('muted', 'true');
		// this._video.style.display = 'none';
		document.body.appendChild(video_container);
		const texture = new VideoTexture(this._video);
		const inputTexture = input_contents[0];
		if (inputTexture) {
			TextureParamsController.copyTextureAttributes(texture, inputTexture);
		}
		await this.textureParamsController.update(texture);

		if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			const constraints = {video: {width: this.pv.res.x, height: this.pv.res.y, facingMode: 'user'}};

			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => {
					// apply the stream to the video element used in the texture
					if (!this._video) {
						return;
					}
					this._video.srcObject = stream;
					this._video.play();
					this.setTexture(texture);
				})
				.catch((error) => {
					this.states.error.set('Unable to access the camera/webcam');
				});
		} else {
			this.states.error.set('MediaDevices interface not available.');
		}
	}
}
