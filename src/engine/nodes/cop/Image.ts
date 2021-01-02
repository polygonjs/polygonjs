/**
 * Imports an image file.
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
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
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {CopFileTypeController} from './utils/FileTypeController';

export function ImageCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param url to fetch the image from */
		url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
			fileBrowse: {type: [FileType.TEXTURE]},
		});
		/** @param reload the image */
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				ImageCopNode.PARAM_CALLBACK_reload(node as ImageCopNode, param);
			},
		});
	};
}
class ImageCopParamsConfig extends TextureParamConfig(ImageCopParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new ImageCopParamsConfig();

export class ImageCopNode extends TypedCopNode<ImageCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'image';
	}
	async required_modules() {
		if (this.p.url.is_dirty) {
			await this.p.url.compute();
		}
		const ext = CoreTextureLoader.get_extension(this.pv.url || '');
		return CoreTextureLoader.module_names(ext);
	}

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
			await this.cook_for_image();
		} else {
			this.states.error.set('input is not an image');
		}
	}

	private async cook_for_image() {
		const texture = await this._load_texture(this.pv.url);

		if (texture) {
			this.texture_params_controller.update(texture);
			this.set_texture(texture);
		} else {
			this.clear_texture();
		}
	}

	resolved_url() {
		return this.pv.url;
	}

	//
	//
	// UTILS
	//
	//
	static PARAM_CALLBACK_reload(node: ImageCopNode, param: BaseParamType) {
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
