import {TypedCopNode} from './_Base';
import {VideoTexture} from 'three/src/textures/VideoTexture';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';

export function WebcamCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		res = ParamConfig.VECTOR2([1024, 1024]);
	};
}
class WebCamCopParamsConfig extends TextureParamConfig(WebcamCopParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new WebCamCopParamsConfig();

export class WebCamCopNode extends TypedCopNode<WebCamCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'web_cam';
	}

	private _video: HTMLVideoElement | undefined;
	public readonly texture_params_controller: TextureParamsController = new TextureParamsController(this);
	async cook() {
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

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
					this.set_texture(texture);
				})
				.catch((error) => {
					this.states.error.set('Unable to access the camera/webcam');
				});
		} else {
			this.states.error.set('MediaDevices interface not available.');
		}
	}
}
