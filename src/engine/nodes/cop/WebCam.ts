/**
 * Imports a video from your webcam
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {VideoTexture, Texture, sRGBEncoding} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CopType} from '../../poly/registers/nodes/types/Cop';

enum WebCamFacingMode {
	USER = 'user',
	ENVIRONMENT = 'environment',
}
const WEBCAM_FACING_MODES: WebCamFacingMode[] = [WebCamFacingMode.USER, WebCamFacingMode.ENVIRONMENT];

export function WebCamCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param texture resolution */
		res = ParamConfig.VECTOR2([1024, 1024]);
		/** @param facingMode (on a mobile device, 'user' is the front camera, 'environment' is the back one ) */
		facingMode = ParamConfig.INTEGER(WEBCAM_FACING_MODES.indexOf(WebCamFacingMode.USER), {
			menu: {
				entries: WEBCAM_FACING_MODES.map((name, value) => ({name, value})),
			},
		});
	};
}
class WebCamCopParamsConfig extends TextureParamConfig(WebCamCopParamConfig(NodeParamsConfig), {
	tencoding: true,
	encoding: sRGBEncoding,
}) {}

const ParamsConfig = new WebCamCopParamsConfig();

export class WebCamCopNode extends TypedCopNode<WebCamCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.WEB_CAM;
	}

	private _video: HTMLVideoElement | undefined;
	HTMLVideoElement() {
		return this._video;
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	static override displayedInputNames(): string[] {
		return ['optional texture to copy attributes from'];
	}
	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}
	override dispose() {
		super.dispose();
		this._cancelWebcamRequest();
	}
	setFacingMode(facingMode: WebCamFacingMode) {
		this.p.facingMode.set(WEBCAM_FACING_MODES.indexOf(facingMode));
	}

	private _stream: MediaStream | undefined;
	private _cancelWebcamRequest() {
		try {
			if (this._stream) {
				this._stream.getTracks().forEach((track) => track.stop());
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

	override async cook(inputContents: Texture[]) {
		this._video = this._createHTMLVideoElement();

		const texture = new VideoTexture(this._video);
		const inputTexture = inputContents[0];
		if (inputTexture) {
			TextureParamsController.copyTextureAttributes(texture, inputTexture);
		}
		await this.textureParamsController.update(texture);

		if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			const facingMode = WEBCAM_FACING_MODES[this.pv.facingMode];
			const constraints = {
				video: {
					width: this.pv.res.x,
					height: this.pv.res.y,
					facingMode,
				},
			};

			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((stream) => {
					this._stream = stream;
					// apply the stream to the video element used in the texture
					if (!this._video) {
						return;
					}
					const video = this._video;
					// video.onload = () => {
					// 	console.log('onLoad');
					// };
					// .setTexture is called only in .oncanplay
					// as otherwise, if it is given to actor/trackHand
					// too early
					// then the computer vision would crash
					video.oncanplay = () => {
						video.play();
						this.setTexture(texture);
					};
					video.onerror = (err) => {
						this.states.error.set(`webcam video error: ${err}`);
					};
					video.srcObject = stream;
				})
				.catch((error) => {
					this.states.error.set('Unable to access the camera/webcam');
				});
		} else {
			const isHttps = window.location.protocol.startsWith('https');
			if (isHttps) {
				this.states.error.set(
					'MediaDevices interface not available. Please check that your connection is secure (using https)'
				);
			} else {
				this.states.error.set('https is required to use the webcam node');
			}
		}
	}
}
