import {Constructor} from '../../../../../types/GlobalTypes';
import {Texture} from 'three';
import {TypedCopNode} from './../../_Base';
import {BaseNodeType} from '../../../_Base';
import {BaseParamType} from '../../../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './../../utils/TextureParamsController';
import {isUrlStaticImage} from '../../../../../core/FileTypeController';
import {InputCloneMode} from '../../../../poly/InputCloneMode';
import {isBooleanTrue} from '../../../../../core/BooleanValue';
import {FileTypeCheckCopParamConfig} from './../../utils/CheckFileType';
import {Poly} from '../../../../Poly';
import {BaseCoreImageLoader} from '../../../../../core/loader/texture/_BaseImageLoader';

interface CopImageNodeFactoryOptions {
	type: string;
	defaultUrl: string;
	browseExtensions: string[];
	getLoader: (url: string, node: BaseNodeType) => BaseCoreImageLoader;
}

function imageCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param url to fetch the image from */
		url = ParamConfig.STRING('');
		/** @param reload the image */
		reload = ParamConfig.BUTTON(null);
	};
}

class BaseImageCopParamsConfig extends FileTypeCheckCopParamConfig(
	TextureParamConfig(imageCopParamConfig(NodeParamsConfig))
) {}

const ParamsConfig = new BaseImageCopParamsConfig();

export class copImageNodeFactoryFactoryResult extends TypedCopNode<BaseImageCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);
}

export function copImageNodeFactoryFactory(
	options: CopImageNodeFactoryOptions
): typeof copImageNodeFactoryFactoryResult {
	function imageCopParamConfig<TBase extends Constructor>(Base: TBase) {
		return class Mixin extends Base {
			/** @param url to fetch the image from */
			url = ParamConfig.STRING(options.defaultUrl, {
				fileBrowse: {extensions: options.browseExtensions},
			});
			/** @param reload the image */
			reload = ParamConfig.BUTTON(null, {
				callback: (node: BaseNodeType, param: BaseParamType) => {
					BaseImageCopNode.PARAM_CALLBACK_reload(node as BaseImageCopNode, param);
				},
			});
		};
	}

	class BaseImageCopParamsConfig extends FileTypeCheckCopParamConfig(
		TextureParamConfig(imageCopParamConfig(NodeParamsConfig))
	) {}

	const ParamsConfig = new BaseImageCopParamsConfig();

	class BaseImageCopNode extends TypedCopNode<BaseImageCopParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return options.type;
		}

		public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

		static override displayedInputNames(): string[] {
			return ['optional texture to copy attributes from'];
		}
		override dispose(): void {
			super.dispose();
			Poly.blobs.clearBlobsForNode(this);
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
		static PARAM_CALLBACK_reload(node: BaseImageCopNode, param: BaseParamType) {
			node.paramCallbackReload();
		}
		private paramCallbackReload() {
			// this.clearLoadedBlob();
			// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
			// this.p.url.set_successors_dirty();
			this.p.url.setDirty();
		}
		protected _loader() {
			return options.getLoader(this.pv.url, this);
		}

		private async _loadTexture() {
			let texture: Texture | null = null;

			try {
				texture = await this._loader().loadImage({
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
		// clearLoadedBlob() {
		// 	const loader = this._loader();
		// 	loader.deregisterUrl();
		// }
	}

	return BaseImageCopNode;
}
