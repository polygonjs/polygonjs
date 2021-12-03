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
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {sRGBEncoding} from 'three/src/constants';

export function WebCamCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param texture resolution */
		res = ParamConfig.VECTOR2([1024, 1024]);
	};
}
class WebCamCopParamsConfig extends TextureParamConfig(WebCamCopParamConfig(NodeParamsConfig), {
	tencoding: true,
	encoding: sRGBEncoding,
}) {}

const ParamsConfig = new WebCamCopParamsConfig();

export class WebCamCopNode extends TypedCopNode<WebCamCopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return CopType.WEB_CAM;
	}

	private _video: HTMLVideoElement | undefined;
	HTMLVideoElement() {
		return this._video;
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	static displayedInputNames(): string[] {
		return ['optional texture to copy attributes from'];
	}
	initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}
	dispose() {
		super.dispose();
		this._cancelWebcamRequest();
	}
	private _stream: MediaStream | undefined;
	private _cancelWebcamRequest() {
		try {
			if (this._stream) {
				this._stream.getTracks().forEach(function (track) {
					track.stop();
				});
			}
		} catch (err) {
			console.error(err);
			console.warn(`failed to cancel webcam request`);
		}
	}

	private _createHTMLVideoElement() {
		if (this._video) {
			document.body.removeChild(this._video);
		}
		const element = document.createElement('video');
		element.style.display = 'none';
		// make sure to call this during the cook method
		// to ensure that res.x and res.y have a value
		element.width = this.pv.res.x;
		element.height = this.pv.res.y;
		element.autoplay = true;
		element.setAttribute('autoplay', 'true');
		element.setAttribute('muted', 'true');
		element.setAttribute('playsinline', 'true');
		document.body.appendChild(element);

		return element;
	}

	async cook(input_contents: Texture[]) {
		this._video = this._createHTMLVideoElement();

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
					this._stream = stream;
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
