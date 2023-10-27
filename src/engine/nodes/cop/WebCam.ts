/**
 * Imports a video from your webcam
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {TypedCopNode} from './_Base';
import {VideoTexture, Texture, SRGBColorSpace} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CopType} from '../../poly/registers/nodes/types/Cop';
// import {coreDebug, coreMountDebugElement} from '../../../core/DebugUtils';

enum WebCamFacingMode {
	USER = 'user',
	ENVIRONMENT = 'environment',
}
const WEBCAM_FACING_MODES: WebCamFacingMode[] = [WebCamFacingMode.USER, WebCamFacingMode.ENVIRONMENT];
let videoCount = 0;
let streamCount = 0;
let canPlayCount = 0;
interface StreamAcquireResult {
	dimensionsSwapRequired: boolean;
}

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
	tcolorSpace: true,
	colorSpace: SRGBColorSpace,
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

	override initializeNode() {
		// coreMountDebugElement();
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

	private _createHTMLVideoElement(width: number, height: number) {
		// if (this._video) {
		// 	document.body.removeChild(this._video);
		// }
		const element = document.createElement('video');
		// element.style.display = 'none';
		// // make sure to call this during the cook method
		// // to ensure that res.x and res.y have a value
		element.width = width;
		element.height = height;
		element.autoplay = true;
		element.setAttribute('autoplay', 'true');
		element.setAttribute('muted', 'true');
		element.setAttribute('playsinline', 'true');

		// coreDebug({orient: screenOrientation()});
		// document.body.appendChild(element);

		return element;
	}

	override async cook(inputContents: Texture[]) {
		const inputTexture = inputContents[0];
		const result = await this._streamToTexture(inputTexture, false);
		if (result && result.dimensionsSwapRequired) {
			await this._streamToTexture(inputTexture, true);
		}
	}

	private async _streamToTexture(
		inputTexture: Texture | null,
		swapDimensions: boolean
	): Promise<StreamAcquireResult | undefined> {
		const x = swapDimensions ? this.pv.res.y : this.pv.res.x;
		const y = swapDimensions ? this.pv.res.x : this.pv.res.y;
		const width = x;
		const height = y;

		if (width <= 0 || height <= 0) {
			this.states.error.set(`invalid resolution ${width}x${height}`);
			return;
		}

		const _checkDimensionsValid = (): boolean => {
			return width == x && height == y;
		};
		const setErrorFromInvalidDimensions = () => {
			this.states.error.set(`recompute needed ${width}x${height} is not ${x}x${y}`);
		};

		const videoElement = this._createHTMLVideoElement(width, height);
		// coreDebug({width, height, videoCount});
		videoCount++;

		const texture = new VideoTexture(videoElement);
		if (inputTexture) {
			TextureParamsController.copyTextureAttributes(texture, inputTexture);
		}
		await this.textureParamsController.update(texture);

		if (!_checkDimensionsValid()) {
			setErrorFromInvalidDimensions();
			return;
		}

		return new Promise((resolve) => {
			if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
				const facingMode = WEBCAM_FACING_MODES[this.pv.facingMode];
				const constraints: MediaStreamConstraints = {
					video: {
						width,
						height,
						aspectRatio: width / height,
						facingMode,
					},
					audio: false,
				};

				this._cancelWebcamRequest();

				navigator.mediaDevices
					.getUserMedia(constraints)
					.then((stream) => {
						if (!_checkDimensionsValid()) {
							setErrorFromInvalidDimensions();
							return;
						}

						this._stream = stream;
						// apply the stream to the video element used in the texture
						// video.onload = () => {
						// 	console.log('onLoad');
						// };
						// .setTexture is called only in .oncanplay
						// as otherwise, if it is given to actor/trackHand
						// too early
						// then the computer vision would crash
						// coreDebug({streamCount});
						streamCount++;
						let _onCanPlayProcessed = false;
						videoElement.oncanplay = () => {
							if (_onCanPlayProcessed) {
								// make sure we only process this once
								return;
							}
							_onCanPlayProcessed = true;
							// coreDebug({
							// 	canPlayCount,
							// 	[canPlayCount]: `${width}x${height}`,
							// });
							canPlayCount++;
							if (!_checkDimensionsValid()) {
								setErrorFromInvalidDimensions();
								return;
							}
							/**
							 * we currently need to check if the resulting video
							 * has the expected dimensions, as there are situations
							 * on mobile where it does not.
							 * When that is the case, we try again to get the stream
							 * with swapped dimensions.
							 */
							this._video = videoElement;
							const dimensionsMatchWithoutSwap =
								Math.round(videoElement.videoWidth) == Math.round(width) &&
								Math.round(videoElement.videoHeight) == Math.round(height);

							if (swapDimensions || dimensionsMatchWithoutSwap) {
								this.setTexture(texture);
							} else {
								resolve({dimensionsSwapRequired: true});
							}
						};
						videoElement.onerror = (err) => {
							this.states.error.set(`webcam video error: ${err}`);
						};
						videoElement.srcObject = stream;
						videoElement.play();
					})
					.catch((error) => {
						console.log(`error ${width}x${height}`, error, {constraints});
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
		});
	}
}
