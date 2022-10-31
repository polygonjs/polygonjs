/**
 * Imports a LUT to be used in Post nodes
 *
 */
import {ParamEvent} from './../../poly/ParamEvent';
import {ClampToEdgeWrapping, LinearFilter, Texture, TextureLoader} from 'three';
import {TypedCopNode} from './_Base';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ImageExtension} from '../../../core/FileTypeController';
import {LUT3dlLoader, LUTCubeLoader} from 'postprocessing';
import {LOADING_MANAGER} from '../../../core/loader/_Base';

type OnTextureLoad = (texture: Texture) => void;
class LutCopParamsConfig extends NodeParamsConfig {
	/** @param url to fetch the gif from */
	url = ParamConfig.STRING('', {
		fileBrowse: {extensions: [ImageExtension.GIF]},
	});
	/** @param reload the image */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			LutCopNode.PARAM_CALLBACK_reload(node as LutCopNode);
		},
	});
}

const ParamsConfig = new LutCopParamsConfig();

export class LutCopNode extends TypedCopNode<LutCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'lut';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}
	override async cook(input_contents: Texture[]) {
		const textureLoader = new TextureLoader(LOADING_MANAGER);

		let loader: TextureLoader | LUT3dlLoader | LUTCubeLoader = textureLoader;
		let onLoad: OnTextureLoad | null = (texture) => {
			texture.generateMipmaps = false;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.wrapS = ClampToEdgeWrapping;
			texture.wrapT = ClampToEdgeWrapping;
			texture.flipY = false;
		};
		const {url} = this.pv;
		if (/.3dl$/im.test(url)) {
			loader = new LUT3dlLoader(LOADING_MANAGER);
			onLoad = null;
		}
		if (/.cube$/im.test(url)) {
			loader = new LUTCubeLoader(LOADING_MANAGER);
			onLoad = null;
		}
		loader.load(this.pv.url, (texture: Texture) => {
			console.log(texture);
			if (loader instanceof TextureLoader)
				if (onLoad) {
					// texture.name = entry[0];
					onLoad(texture);
				}

			this.setTexture(texture);
		});
	}
	static PARAM_CALLBACK_reload(node: LutCopNode) {
		node.paramCallbackReload();
	}
	private paramCallbackReload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		// this.p.url.set_successors_dirty();
		this.p.url.setDirty();
		this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
	}
}
