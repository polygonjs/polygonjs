/**
 * Imports an image file.
 *
 * @remarks
 * Performance tip: If possible, try to set min filter to LinearFilter in order to avoid the generation of mipmaps.
 * [https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491](https://discourse.threejs.org/t/threejs-app-performance-point-click-game/18491)
 */
import {Constructor} from '../../../types/GlobalTypes';
import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {CoreLoaderTexture} from '../../../core/loader/Texture';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {FileType} from '../../params/utils/OptionsController';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {isUrlStaticImage} from '../../../core/FileTypeController';
import {CoreBaseLoader} from '../../../core/loader/_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {FileTypeCheckCopParamConfig} from './utils/CheckFileType';

function ImageCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param url to fetch the image from */
		url = ParamConfig.STRING(CoreLoaderTexture.PARAM_DEFAULT, {
			fileBrowse: {type: [FileType.TEXTURE_IMAGE]},
		});
		/** @param reload the image */
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				ImageCopNode.PARAM_CALLBACK_reload(node as ImageCopNode, param);
			},
		});
	};
}

class ImageCopParamsConfig extends FileTypeCheckCopParamConfig(
	TextureParamConfig(ImageCopParamConfig(NodeParamsConfig))
) {}

const ParamsConfig = new ImageCopParamsConfig();

export class ImageCopNode extends TypedCopNode<ImageCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'image';
	}
	override async requiredModules() {
		if (this.p.url.isDirty()) {
			await this.p.url.compute();
		}
		const ext = CoreBaseLoader.extension(this.pv.url || '');
		return CoreLoaderTexture.module_names(ext);
	}

	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	static override displayedInputNames(): string[] {
		return ['optional texture to copy attributes from'];
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}
	override async cook(input_contents: Texture[]) {
		if (isBooleanTrue(this.pv.checkFileType) && !isUrlStaticImage(this.pv.url)) {
			this.states.error.set('url is not an image');
		} else {
			const texture = await this._loadTexture();

			if (texture) {
				const inputTexture = input_contents[0];
				if (inputTexture) {
					TextureParamsController.copyTextureAttributes(texture, inputTexture);
				}

				await this.textureParamsController.update(texture);
				this.setTexture(texture);
			} else {
				this._clearTexture();
			}
		}
	}

	//
	//
	// UTILS
	//
	//
	static PARAM_CALLBACK_reload(node: ImageCopNode, param: BaseParamType) {
		node.paramCallbackReload();
	}
	private paramCallbackReload() {
		this.clearLoadedBlob();
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		// this.p.url.set_successors_dirty();
		this.p.url.setDirty();
	}
	private _loader() {
		return new CoreLoaderTexture(this.pv.url, this.p.url, this, this.scene(), {
			forceImage: !isBooleanTrue(this.pv.checkFileType),
		});
	}

	private async _loadTexture() {
		let texture: Texture | null = null;

		try {
			texture = await this._loader().load_texture_from_url_or_op({
				tdataType: this.pv.ttype && this.pv.tadvanced,
				dataType: this.pv.type,
			});
			if (texture) {
				texture.matrixAutoUpdate = false;
			}
		} catch (e) {}
		if (!texture) {
			this.states.error.set(`could not load texture '${this.pv.url}'`);
		}
		return texture;
	}
	clearLoadedBlob() {
		const loader = this._loader();
		loader.deregisterUrl();
	}
}
