/**
 * Creates a texture from text
 *
 *
 */
import {DataTexture, Vector2, RGBAFormat, UnsignedByteType} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {Constructor} from '../../../types/GlobalTypes';
import {DEFAULT_FONT_URL_TTF} from '../../../core/Assets';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {NodeContext} from '../../poly/NodeContext';
import {loadAndUseFont} from '../../../core/Text';
import {sanitizeName} from '../../../core/String';

const _v2 = new Vector2();

export function TextCopNodeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param font used */
		font = ParamConfig.STRING(DEFAULT_FONT_URL_TTF, {
			fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopType.TEXT]},
		});
		/** @param text created */
		text = ParamConfig.STRING('polygonjs', {
			multiline: true,
		});
		/** @param render resolution */
		resolution = ParamConfig.VECTOR2([256, 256]);
		/** @param font size */
		fontSize = ParamConfig.INTEGER(32, {
			range: [0, 256],
			rangeLocked: [true, false],
		});
		/** @param background color */
		bgColor = ParamConfig.COLOR([0, 0, 0]);
		/** @param background alpha */
		bgAlpha = ParamConfig.FLOAT(0);
		/** @param text color */
		textColor = ParamConfig.COLOR([1, 1, 1]);
		/** @param text alpha */
		textAlpha = ParamConfig.FLOAT(1);
	};
}
class TextCopParamConfig extends TextureParamConfig(TextCopNodeParamConfig(NodeParamsConfig)) {}

const ParamsConfig = new TextCopParamConfig();

export class TextCopNode extends TypedCopNode<TextCopParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<CopType.TEXT> {
		return CopType.TEXT;
	}
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	private _dataTexture: DataTexture | undefined;
	override async cook() {
		this._dataTexture = this._findOrCreateDataTexture();

		const url = this.pv.font.split('/');
		const fontNameFromUrl = url[url.length - 1].split('.')[0];
		await loadAndUseFont({
			texture: this._dataTexture,
			text: this.pv.text,
			fontFamily: sanitizeName(this.path()) + fontNameFromUrl,
			fontSize: this.pv.fontSize,
			fontUrl: this.pv.font,
			resolution: this.pv.resolution,
			bgColor: this.pv.bgColor,
			bgAlpha: this.pv.bgAlpha,
			textColor: this.pv.textColor,
			textAlpha: this.pv.textAlpha,
		});

		await this.textureParamsController.update(this._dataTexture);

		this.setTexture(this._dataTexture);
	}

	private _dataTextureResolutionValid(texture: DataTexture) {
		const image = texture.source.data;
		this._requestedResolution(_v2);
		return image.width == _v2.x && image.height == _v2.y;
	}
	private _requestedResolution(target: Vector2) {
		target.copy(this.pv.resolution);
	}
	private _findOrCreateDataTexture() {
		this._requestedResolution(_v2);
		if (this._dataTexture && this._dataTextureResolutionValid(this._dataTexture)) {
			return this._dataTexture;
		}
		const size = _v2.x * _v2.y * 4;
		const pixelBuffer = new Uint8Array(size);

		const dataTexture = new DataTexture(pixelBuffer, _v2.x, _v2.y, RGBAFormat, UnsignedByteType);
		return dataTexture;
	}
}
