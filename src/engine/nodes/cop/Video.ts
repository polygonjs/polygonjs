/*
TIPS to load videos
- qt-faststart for faster start
- have both mp4 and ogv

PERFORMANCE:
https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491
try to set Texture.minFilter to THREE.LinearFilter in order to avoid the generation of mipmaps
*/

import {VideoTexture} from 'three/src/textures/VideoTexture';
import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {CoreTextureLoader} from '../../../core/loader/Texture';

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DesktopFileType} from '../../params/utils/OptionsController';
import {CopFileTypeController} from './utils/FileTypeController';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';

export function VideoCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
			desktop_browse: {file_type: DesktopFileType.TEXTURE},
			asset_reference: true,
		});
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				VideoCopNode.PARAM_CALLBACK_reload(node as VideoCopNode, param);
			},
		});
		play = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_play(node as VideoCopNode);
			},
		});
		muted = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_muted(node as VideoCopNode);
			},
		});
		loop = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_video_update_loop(node as VideoCopNode);
			},
		});
		video_time = ParamConfig.FLOAT(0, {
			cook: false,
			// do not use video_time, as calling "this._video.currentTime =" every frame is really expensive
		});
		set_video_time = ParamConfig.BUTTON(null, {
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
	async required_modules() {
		if (this.p.url.is_dirty) {
			await this.p.url.compute();
		}
		const ext = CoreTextureLoader.get_extension(this.pv.url || '');
		return CoreTextureLoader.module_names(ext);
	}

	private _video: HTMLVideoElement | undefined;
	// private _data_texture_controller: DataTextureController | undefined;
	private _texture_loader: CoreTextureLoader | undefined;
	public readonly texture_params_controller: TextureParamsController = new TextureParamsController(this);

	initialize_node() {
		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.url], () => {
					const url = this.pv.url;
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
			this.texture_params_controller.update(texture);
			this.set_texture(texture);
		} else {
			this.cook_controller.end_cook();
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
			const param = this.p.video_time;
			if (param.is_dirty) {
				await param.compute();
			}
			this._video.currentTime = param.value;
		}
	}
	private video_update_muted() {
		if (this._video) {
			this._video.muted = this.pv.muted;
		}
	}
	private video_update_loop() {
		if (this._video) {
			this._video.loop = this.pv.loop;
		}
	}

	private video_update_play() {
		if (this._video) {
			if (this.pv.play) {
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
		this.p.url.set_dirty();
	}

	private async _load_texture(url: string) {
		let texture: Texture | VideoTexture | null = null;
		const url_param = this.p.url;
		this._texture_loader = this._texture_loader || new CoreTextureLoader(this, url_param);
		try {
			texture = await this._texture_loader.load_texture_from_url_or_op(url);
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
