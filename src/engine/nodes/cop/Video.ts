/**
 * Imports a video
 *
 * @remarks
 * TIP: to ensure that your video starts as soon as possible, make sure to pre-process it with a tool like qt-faststart. There are many places where you can find it, but here are some suggestions:
 *
 * - download it from [https://pypi.org/project/qtfaststart/](https://pypi.org/project/qtfaststart/)
 * - download it from [https://manpages.debian.org/stretch/ffmpeg/qt-faststart.1.en.html](https://manpages.debian.org/stretch/ffmpeg/qt-faststart.1.en.html)
 * - with ffmpeg, you can use the following command line: `ffmpeg -i in.mp4 -c copy -map 0 -movflags +faststart out.mp4
`

In a future version of this node, it will also be possible to link it to a video tag that could already be in your html DOM. This way, you could sets multiple source tags (one with mp4 and one with ogv) instead of a single url.

 */
import {Constructor} from '../../../types/GlobalTypes';
import {VideoTexture} from 'three/src/textures/VideoTexture';
import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {CoreTextureLoader} from '../../../core/loader/Texture';

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FileType} from '../../params/utils/OptionsController';
import {CopFileTypeController} from './utils/FileTypeController';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {isBooleanTrue} from '../../../core/BooleanValue';

export function VideoCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param url to fetch the video from */
		url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
			fileBrowse: {type: [FileType.TEXTURE_VIDEO]},
		});
		/** @param reload the video */
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				VideoCopNode.PARAM_CALLBACK_reload(node as VideoCopNode, param);
			},
		});
		/** @param play the video */
		play = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_play(node as VideoCopNode);
			},
		});
		/** @param set the video muted attribute */
		muted = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_muted(node as VideoCopNode);
			},
		});
		/** @param set the video loop attribute */
		loop = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_loop(node as VideoCopNode);
			},
		});
		/** @param set the video time */
		videoTime = ParamConfig.FLOAT(0, {
			cook: false,
			// do not use videoTime, as calling "this._video.currentTime =" every frame is really expensive
		});
		/** @param seek the video at the time specified in vide_time */
		setVideoTime = ParamConfig.BUTTON(null, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_time(node as VideoCopNode);
			},
		});
	};
}

class VideoCopParamsConfig extends TextureParamConfig(VideoCopParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new VideoCopParamsConfig();

export class VideoCopNode extends TypedCopNode<VideoCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'video';
	}
	async requiredModules() {
		if (this.p.url.isDirty()) {
			await this.p.url.compute();
		}
		const ext = CoreTextureLoader.get_extension(this.pv.url || '');
		return CoreTextureLoader.module_names(ext);
	}

	private _video: HTMLVideoElement | undefined;
	// private _data_texture_controller: DataTextureController | undefined;
	private _texture_loader: CoreTextureLoader | undefined;
	public readonly texture_params_controller: TextureParamsController = new TextureParamsController(this);

	initializeNode() {
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.url], () => {
					const url = this.p.url.rawInput();
					if (url) {
						const elements = url.split('/');
						return elements[elements.length - 1];
					} else {
						return '';
					}
				});
			});
		});
	}
	async cook() {
		if (CopFileTypeController.is_static_image_url(this.pv.url)) {
			this.states.error.set('input is not a video');
		} else {
			await this.cook_for_video();
		}
	}

	private async cook_for_video() {
		const texture = await this._load_texture(this.pv.url);

		if (texture) {
			this._video = texture.image;

			this.video_update_loop();
			this.video_update_muted();
			this.video_update_play();
			this.video_update_time();
			await this.texture_params_controller.update(texture);
			this.setTexture(texture);
		} else {
			this.cookController.endCook();
		}
	}

	resolved_url() {
		return this.pv.url;
	}

	static PARAM_CALLBACK_video_update_time(node: VideoCopNode) {
		node.video_update_time();
	}
	static PARAM_CALLBACK_video_update_play(node: VideoCopNode) {
		node.video_update_play();
	}
	static PARAM_CALLBACK_video_update_muted(node: VideoCopNode) {
		node.video_update_muted();
	}
	static PARAM_CALLBACK_video_update_loop(node: VideoCopNode) {
		node.video_update_loop();
	}
	private async video_update_time() {
		if (this._video) {
			const param = this.p.videoTime;
			if (param.isDirty()) {
				await param.compute();
			}
			this._video.currentTime = param.value;
		}
	}
	private video_update_muted() {
		if (this._video) {
			this._video.muted = isBooleanTrue(this.pv.muted);
		}
	}
	private video_update_loop() {
		if (this._video) {
			this._video.loop = isBooleanTrue(this.pv.loop);
		}
	}

	private video_update_play() {
		if (this._video) {
			if (isBooleanTrue(this.pv.play)) {
				this._video.play();
			} else {
				this._video.pause();
			}
		}
	}
	//
	//
	// UTILS
	//
	//
	static PARAM_CALLBACK_reload(node: VideoCopNode, param: BaseParamType) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		// this.p.url.set_successors_dirty();
		this.p.url.setDirty();
	}

	private async _load_texture(url: string) {
		let texture: Texture | VideoTexture | null = null;
		const url_param = this.p.url;
		this._texture_loader = this._texture_loader || new CoreTextureLoader(this, url_param);
		try {
			texture = await this._texture_loader.load_texture_from_url_or_op(url, {
				tdataType: this.pv.ttype && this.pv.tadvanced,
				dataType: this.pv.type,
			});
			if (texture) {
				texture.matrixAutoUpdate = false;
			}
		} catch (e) {}
		if (!texture) {
			this.states.error.set(`could not load texture '${url}'`);
		}
		return texture;
	}
}
