/**
 * Creates a cube map
 *
 *
 */
import {Texture} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {ImageExtension} from '../../../core/FileTypeController';
import {BaseNodeType} from '../_Base';
import {ParamEvent} from '../../poly/ParamEvent';
import {Poly} from '../../Poly';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TextureParamConfig, TextureParamsController} from './utils/TextureParamsController';
import {Constructor} from '../../../types/GlobalTypes';
import {CoreCubeTextureLoader} from '../../../core/loader/texture/Cube';

export enum CubeMapUrlKey {
	P = 'p',
	N = 'n',
}
// const URL_KEYS:UrlKey[]=[UrlKey.N,UrlKey.P]
export enum CubeMapUrlAxis {
	X = 'x',
	Y = 'y',
	Z = 'z',
}
// const URL_AXISES:UrlAxis[]=[UrlAxis.X,UrlAxis.Y,UrlAxis.Z]

export function cubeMapUrlExpression(urlKey: CubeMapUrlKey, urlAxis: CubeMapUrlAxis) {
	return `\`ch('prefix')\`${urlKey}${urlAxis}\`ch('suffix')\``;
}

function CubeCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param url prefix */
		prefix = ParamConfig.STRING('', {
			fileBrowse: {
				extensions: [ImageExtension.PNG, ImageExtension.JPEG, ImageExtension.JPG, ImageExtension.WEBP],
			},
		});
		/** @param url prefix */
		suffix = ParamConfig.STRING('.png');
		/** @param reload the image */
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				CubeCopNode.PARAM_CALLBACK_reload(node as CubeCopNode);
			},
		});
		/** @param px url */
		px = ParamConfig.STRING(cubeMapUrlExpression(CubeMapUrlKey.P, CubeMapUrlAxis.X));
		/** @param nx url */
		nx = ParamConfig.STRING(cubeMapUrlExpression(CubeMapUrlKey.N, CubeMapUrlAxis.X));
		/** @param py url */
		py = ParamConfig.STRING(cubeMapUrlExpression(CubeMapUrlKey.P, CubeMapUrlAxis.Y));
		/** @param ny url */
		ny = ParamConfig.STRING(cubeMapUrlExpression(CubeMapUrlKey.N, CubeMapUrlAxis.Y));
		/** @param pz url */
		pz = ParamConfig.STRING(cubeMapUrlExpression(CubeMapUrlKey.P, CubeMapUrlAxis.Z));
		/** @param nz url */
		nz = ParamConfig.STRING(cubeMapUrlExpression(CubeMapUrlKey.N, CubeMapUrlAxis.Z));
	};
}

class CubeCopParamsConfig extends TextureParamConfig(CubeCopParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new CubeCopParamsConfig();
export class CubeCopNode extends TypedCopNode<CubeCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.CUBE;
	}

	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);
	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputContents: Texture[]) {
		const texture = await this._loadTexture();

		if (texture) {
			const inputTexture = inputContents[0];
			if (inputTexture) {
				TextureParamsController.copyTextureAttributes(texture, inputTexture);
			}

			await this.textureParamsController.update(texture);
			this.setTexture(texture);
		} else {
			this._clearTexture();
		}
	}

	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private async _loadTexture() {
		const pv = this.pv;
		const urls: string[] = [pv.px, pv.nx, pv.py, pv.ny, pv.pz, pv.nz];
		let texture: Texture | null = null;
		try {
			const loader = new CoreCubeTextureLoader(urls, this);
			texture = await loader.loadImage({
				tdataType: this.pv.ttype && this.pv.tadvanced,
				dataType: this.pv.type,
			});
			if (texture) {
				texture.matrixAutoUpdate = false;
			}
		} catch (e) {}
		if (!texture) {
			this.states.error.set(`could not load texture '${urls.join(' ')}'`);
		}
		return texture;
	}

	static PARAM_CALLBACK_reload(node: CubeCopNode) {
		node.paramCallbackReload();
	}
	private paramCallbackReload() {
		this.p.px.setDirty();
		this.p.px.emit(ParamEvent.ASSET_RELOAD_REQUEST);
	}
}
