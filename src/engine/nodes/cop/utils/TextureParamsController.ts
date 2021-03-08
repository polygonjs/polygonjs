import {Constructor, PolyDictionary} from '../../../../types/GlobalTypes';
import {TypedCopNode} from '../_Base';
import {Texture} from 'three/src/textures/Texture';
import {
	// formats
	AlphaFormat,
	RedFormat,
	RedIntegerFormat,
	RGFormat,
	RGIntegerFormat,
	RGBFormat,
	RGBIntegerFormat,
	RGBAFormat,
	RGBAIntegerFormat,
	LuminanceFormat,
	LuminanceAlphaFormat,
	// RGBEFormat, //  removing as it is set to same value as RGBAFormat, so can be confusing
	DepthFormat,
	DepthStencilFormat,

	// types
	UnsignedByteType,
	ByteType,
	ShortType,
	UnsignedShortType,
	IntType,
	UnsignedIntType,
	FloatType,
	HalfFloatType,
	UnsignedShort4444Type,
	UnsignedShort5551Type,
	UnsignedShort565Type,
	UnsignedInt248Type,

	// encodings
	LinearEncoding,
	sRGBEncoding,
	GammaEncoding,
	RGBEEncoding,
	LogLuvEncoding,
	RGBM7Encoding,
	RGBM16Encoding,
	RGBDEncoding,
	BasicDepthPacking,
	RGBADepthPacking,
	// other
	UVMapping,
	CubeReflectionMapping,
	CubeRefractionMapping,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	CubeUVReflectionMapping,
	CubeUVRefractionMapping,
	ClampToEdgeWrapping,
	RepeatWrapping,
	MirroredRepeatWrapping,
} from 'three/src/constants';
import {
	MAG_FILTER_DEFAULT_VALUE,
	MAG_FILTER_MENU_ENTRIES,
	MIN_FILTER_DEFAULT_VALUE,
	MIN_FILTER_MENU_ENTRIES,
} from '../../../../core/cop/ConstantFilter';

const FORMATS = [
	{AlphaFormat},
	{RedFormat},
	{RedIntegerFormat},
	{RGFormat},
	{RGIntegerFormat},
	{RGBFormat},
	{RGBIntegerFormat},
	{RGBAFormat},
	{RGBAIntegerFormat},
	{LuminanceFormat},
	{LuminanceAlphaFormat},
	// {RGBEFormat},
	{DepthFormat},
	{DepthStencilFormat},
];
const TYPES = [
	{UnsignedByteType},
	{ByteType},
	{ShortType},
	{UnsignedShortType},
	{IntType},
	{UnsignedIntType},
	{FloatType},
	{HalfFloatType},
	{UnsignedShort4444Type},
	{UnsignedShort5551Type},
	{UnsignedShort565Type},
	{UnsignedInt248Type},
];

export const MAPPINGS = [
	{UVMapping},
	{CubeReflectionMapping},
	{CubeRefractionMapping},
	{EquirectangularReflectionMapping},
	{EquirectangularRefractionMapping},
	{CubeUVReflectionMapping},
	{CubeUVRefractionMapping},
];

export const ENCODINGS = [
	{LinearEncoding},
	{sRGBEncoding},
	{GammaEncoding},
	{RGBEEncoding},
	{LogLuvEncoding},
	{RGBM7Encoding},
	{RGBM16Encoding},
	{RGBDEncoding},
	{BasicDepthPacking},
	{RGBADepthPacking},
];
export const WRAPPINGS: PolyDictionary<number>[] = [{ClampToEdgeWrapping}, {RepeatWrapping}, {MirroredRepeatWrapping}];

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {CopRendererController} from './RendererController';
import {BaseNodeType} from '../../_Base';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {ParamsValueAccessorType} from '../../utils/params/ParamsValueAccessor';

export function TextureParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to allow updating the texture encoding */
		tencoding = ParamConfig.BOOLEAN(0);
		/** @param sets the texture encoding */
		encoding = ParamConfig.INTEGER(LinearEncoding, {
			visibleIf: {tencoding: 1},
			menu: {
				entries: ENCODINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});

		/** @param toggle on to allow updating the texture mapping */
		tmapping = ParamConfig.BOOLEAN(0);
		/** @param sets the texture mapping */
		mapping = ParamConfig.INTEGER(UVMapping, {
			visibleIf: {tmapping: 1},
			menu: {
				entries: MAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		/** @param toggle on to allow updating the texture wrap */
		twrap = ParamConfig.BOOLEAN(0);
		/** @param sets the texture wrapS */
		wrapS = ParamConfig.INTEGER(RepeatWrapping, {
			visibleIf: {twrap: 1},
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		/** @param sets the texture wrapT */
		wrapT = ParamConfig.INTEGER(RepeatWrapping, {
			visibleIf: {twrap: 1},
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			separatorAfter: true,
		});
		/** @param toggle on to allow updating the texture min filter */
		tminFilter = ParamConfig.BOOLEAN(0);
		/** @param sets the texture min filter */
		minFilter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
			visibleIf: {tminFilter: 1},
			menu: {
				entries: MIN_FILTER_MENU_ENTRIES,
			},
		});
		/** @param toggle on to allow updating the texture mag filter */
		tmagFilter = ParamConfig.BOOLEAN(0);
		/** @param sets the texture mag filter */
		magFilter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
			visibleIf: {tmagFilter: 1},
			menu: {
				entries: MAG_FILTER_MENU_ENTRIES,
			},
		});
		/** @param toggle on to allow updating the texture anisotropy */
		tanisotropy = ParamConfig.BOOLEAN(0);
		/** @param sets the anisotropy from the max value allowed by the renderer */
		useRendererMaxAnisotropy = ParamConfig.BOOLEAN(1, {
			visibleIf: {tanisotropy: 1},
		});
		/** @param sets the anisotropy manually */
		anisotropy = ParamConfig.INTEGER(1, {
			visibleIf: {tanisotropy: 1, useRendererMaxAnisotropy: 0},
			range: [0, 32],
			rangeLocked: [true, false],
		});
		/** @param TBD */
		useCameraRenderer = ParamConfig.BOOLEAN(0, {
			visibleIf: {tanisotropy: 1, useRendererMaxAnisotropy: 1},
			separatorAfter: true,
		});
		/** @param Toggle on to update the flipY */
		tflipY = ParamConfig.BOOLEAN(0);
		/** @param sets the flipY */
		flipY = ParamConfig.BOOLEAN(0, {visibleIf: {tflipY: 1}});

		/** @param toggle on to update the texture transform */
		ttransform = ParamConfig.BOOLEAN(0);
		/** @param updates the texture offset */
		offset = ParamConfig.VECTOR2([0, 0], {
			visibleIf: {ttransform: 1},
			cook: false,
			callback: (node: BaseNodeType) => {
				TextureParamsController.PARAM_CALLBACK_update_offset(node as TextureCopNode);
			},
		});
		/** @param updates the texture repeat */
		repeat = ParamConfig.VECTOR2([1, 1], {
			visibleIf: {ttransform: 1},
			cook: false,
			callback: (node: BaseNodeType) => {
				TextureParamsController.PARAM_CALLBACK_update_repeat(node as TextureCopNode);
			},
		});
		/** @param updates the texture rotation */
		rotation = ParamConfig.FLOAT(0, {
			range: [-1, 1],
			visibleIf: {ttransform: 1},
			cook: false,
			callback: (node: BaseNodeType) => {
				TextureParamsController.PARAM_CALLBACK_update_rotation(node as TextureCopNode);
			},
		});
		/** @param updates the texture center */
		center = ParamConfig.VECTOR2([0, 0], {
			visibleIf: {ttransform: 1},
			cook: false,
			callback: (node: BaseNodeType) => {
				TextureParamsController.PARAM_CALLBACK_update_center(node as TextureCopNode);
			},
		});

		/** @param toggle on to display advanced parameters */
		tadvanced = ParamConfig.BOOLEAN(0);
		/** @param toggle on to allow overriding the texture format */
		tformat = ParamConfig.BOOLEAN(0, {
			visibleIf: {tadvanced: 1},
		});
		/** @param sets the texture format */
		format = ParamConfig.INTEGER(RGBAFormat, {
			visibleIf: {tadvanced: 1, tformat: 1},
			menu: {
				entries: FORMATS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});

		/** @param toggle on to allow overriding the texture type */
		ttype = ParamConfig.BOOLEAN(0, {
			visibleIf: {tadvanced: 1},
		});
		/** @param sets the texture ty[e] */
		type = ParamConfig.INTEGER(UnsignedByteType, {
			visibleIf: {tadvanced: 1, ttype: 1},
			menu: {
				entries: TYPES.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
	};
}

class TextureParamsConfig extends TextureParamConfig(NodeParamsConfig) {}
const ParamsConfig = new TextureParamsConfig();
class TextureCopNode extends TypedCopNode<TextureParamsConfig> {
	params_config = ParamsConfig;
	public readonly texture_params_controller = new TextureParamsController(this);
}

export class TextureParamsController {
	constructor(protected node: TextureCopNode) {}
	async update(texture: Texture) {
		const pv = this.node.pv;
		this._updateEncoding(texture, pv);
		this._updateAdvanced(texture, pv);
		this._updateMapping(texture, pv);
		this._updateWrap(texture, pv);
		this._updateFilter(texture, pv);
		this._updateFlip(texture, pv);
		await this._update_anisotropy(texture, pv);
		this._updateTransform(texture);
	}
	private _updateEncoding(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		if (isBooleanTrue(pv.tencoding)) {
			texture.encoding = pv.encoding;
		}
	}
	private _updateAdvanced(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		if (isBooleanTrue(pv.tadvanced)) {
			if (isBooleanTrue(pv.tformat)) {
				texture.format = pv.format;
			}
			if (isBooleanTrue(pv.ttype)) {
				texture.type = pv.type;
			}
		}
	}
	private _updateMapping(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		if (isBooleanTrue(pv.tmapping)) {
			texture.mapping = pv.mapping;
		}
	}
	private _updateWrap(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		if (isBooleanTrue(pv.twrap)) {
			texture.wrapS = pv.wrapS;
			texture.wrapT = pv.wrapT;
		}
	}
	private _updateFilter(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		if (isBooleanTrue(pv.tminFilter)) {
			texture.minFilter = pv.minFilter;
		}
		if (isBooleanTrue(pv.tminFilter)) {
			texture.magFilter = pv.magFilter;
		}
	}
	private _updateFlip(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		// do not have this in an if block,
		// as to be sure this is set to false in case it is set to true
		// by the texture loader
		texture.flipY = pv.tflipY && pv.flipY;
	}

	private _renderer_controller: CopRendererController | undefined;
	private async _update_anisotropy(texture: Texture, pv: ParamsValueAccessorType<TextureParamsConfig>) {
		if (!isBooleanTrue(pv.tanisotropy)) {
			return;
		}
		this._renderer_controller = this._renderer_controller || new CopRendererController(this.node);
		const renderer = await this._renderer_controller.renderer();
		const max_anisotropy = renderer.capabilities.getMaxAnisotropy();

		if (isBooleanTrue(pv.useRendererMaxAnisotropy)) {
			texture.anisotropy = max_anisotropy;
		} else {
			texture.anisotropy = Math.min(pv.anisotropy, max_anisotropy);
		}
	}

	private _updateTransform(texture: Texture) {
		if (!isBooleanTrue(this.node.pv.ttransform)) {
			return;
		}
		this._updateTransformOffset(texture, false);
		this._updateTransformRepeat(texture, false);
		this._updateTransformRotation(texture, false);
		this._updateTransformCenter(texture, false);
		texture.updateMatrix();
	}
	private _updateTransformOffset(texture: Texture, update_matrix: boolean) {
		texture.offset.copy(this.node.pv.offset);
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	private _updateTransformRepeat(texture: Texture, update_matrix: boolean) {
		texture.repeat.copy(this.node.pv.repeat);
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	private _updateTransformRotation(texture: Texture, update_matrix: boolean) {
		texture.rotation = this.node.pv.rotation;
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	private _updateTransformCenter(texture: Texture, update_matrix: boolean) {
		texture.center.copy(this.node.pv.center);
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	static PARAM_CALLBACK_update_offset(node: TextureCopNode) {
		const texture = node.containerController.container.texture();
		node.texture_params_controller._updateTransformOffset(texture, true);
	}
	static PARAM_CALLBACK_update_repeat(node: TextureCopNode) {
		const texture = node.containerController.container.texture();
		node.texture_params_controller._updateTransformRepeat(texture, true);
	}
	static PARAM_CALLBACK_update_rotation(node: TextureCopNode) {
		const texture = node.containerController.container.texture();
		node.texture_params_controller._updateTransformRotation(texture, true);
	}
	static PARAM_CALLBACK_update_center(node: TextureCopNode) {
		const texture = node.containerController.container.texture();
		node.texture_params_controller._updateTransformCenter(texture, true);
	}
}
