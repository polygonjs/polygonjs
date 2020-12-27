import {TypedCopNode} from '../_Base';
import {Texture} from 'three/src/textures/Texture';
import {
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

	// UnsignedByteType,
	// ByteType,
	// ShortType,
	// UnsignedShortType,
	// IntType,
	// UnsignedIntType,
	// FloatType,
	// HalfFloatType,
	// UnsignedShort4444Type,
	// UnsignedShort5551Type,
	// UnsignedShort565Type,
	// UnsignedInt248Type,
	// AlphaFormat,
	// RGBFormat,
	// RGBAFormat,
	// LuminanceFormat,
	// LuminanceAlphaFormat,
	// RGBEFormat,
	// DepthFormat,
	// DepthStencilFormat,
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
} from 'three/src/constants';
import {
	MAG_FILTER_DEFAULT_VALUE,
	MAG_FILTER_MENU_ENTRIES,
	MIN_FILTER_DEFAULT_VALUE,
	MIN_FILTER_MENU_ENTRIES,
} from '../../../../core/cop/ConstantFilter';

const MAPPINGS = [
	{UVMapping},
	{CubeReflectionMapping},
	{CubeRefractionMapping},
	{EquirectangularReflectionMapping},
	{EquirectangularRefractionMapping},
	{CubeUVReflectionMapping},
	{CubeUVRefractionMapping},
];

const ENCODINGS = [
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
const WRAPPINGS: Dictionary<number>[] = [{ClampToEdgeWrapping}, {RepeatWrapping}, {MirroredRepeatWrapping}];

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {CopRendererController} from './RendererController';
import {BaseNodeType} from '../../_Base';

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
		wrap_s = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
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
		wrap_t = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
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
		wrap_sep = ParamConfig.SEPARATOR(null, {
			visibleIf: {twrap: 1},
		});
		/** @param toggle on to allow updating the texture min filter */
		tminfilter = ParamConfig.BOOLEAN(0);
		/** @param sets the texture min filter */
		min_filter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
			visibleIf: {tminfilter: 1},
			menu: {
				entries: MIN_FILTER_MENU_ENTRIES,
			},
		});
		/** @param toggle on to allow updating the texture mag filter */
		tmagfilter = ParamConfig.BOOLEAN(0);
		/** @param sets the texture mag filter */
		mag_filter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
			visibleIf: {tmagfilter: 1},
			menu: {
				entries: MAG_FILTER_MENU_ENTRIES,
			},
		});
		/** @param toggle on to allow updating the texture anisotropy */
		tanisotropy = ParamConfig.BOOLEAN(0);
		/** @param sets the anisotropy from the max value allowed by the renderer */
		use_renderer_max_anisotropy = ParamConfig.BOOLEAN(1, {
			visibleIf: {tanisotropy: 1},
		});
		/** @param sets the anisotropy manually */
		anisotropy = ParamConfig.INTEGER(1, {
			visibleIf: {tanisotropy: 1, use_renderer_max_anisotropy: 0},
			range: [0, 32],
			rangeLocked: [true, false],
		});
		/** @param TBD */
		use_camera_renderer = ParamConfig.BOOLEAN(0, {
			visibleIf: {tanisotropy: 1, use_renderer_max_anisotropy: 1},
		});
		anisotropy_sep = ParamConfig.SEPARATOR(null, {
			visibleIf: {tanisotropy: 1},
		});
		/** @param Toggle on to update the flipY */
		tflip_y = ParamConfig.BOOLEAN(0);
		/** @param sets the flipY */
		flip_y = ParamConfig.BOOLEAN(0, {visibleIf: {tflip_y: 1}});
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
	update(texture: Texture) {
		const pv = this.node.pv;
		if (pv.tencoding) {
			texture.encoding = pv.encoding;
		}
		if (pv.tmapping) {
			texture.mapping = pv.mapping;
		}
		if (pv.twrap) {
			texture.wrapS = pv.wrap_s;
			texture.wrapT = pv.wrap_t;
		}
		if (pv.tminfilter) {
			texture.minFilter = pv.min_filter;
		}
		if (pv.tminfilter) {
			texture.magFilter = pv.mag_filter;
		}
		this._update_anisotropy(texture);

		// do not have this in an if block,
		// as to be sure this is set to false in case it is set to true
		// by the texture loader
		texture.flipY = pv.tflip_y && pv.flip_y;
		this._update_texture_transform(texture);
	}
	private _renderer_controller: CopRendererController | undefined;
	private async _update_anisotropy(texture: Texture) {
		const pv = this.node.pv;
		if (!pv.tanisotropy) {
			return;
		}
		if (pv.use_renderer_max_anisotropy) {
			this._renderer_controller = this._renderer_controller || new CopRendererController(this.node);
			const renderer = await this._renderer_controller.renderer();
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		} else {
			texture.anisotropy = pv.anisotropy;
		}
	}

	private _update_texture_transform(texture: Texture) {
		if (!this.node.pv.ttransform) {
			return;
		}
		this._update_offset(texture, false);
		this._update_repeat(texture, false);
		this._update_rotation(texture, false);
		this._update_center(texture, false);
		texture.updateMatrix();
	}
	private _update_offset(texture: Texture, update_matrix: boolean) {
		texture.offset.copy(this.node.pv.offset);
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	private _update_repeat(texture: Texture, update_matrix: boolean) {
		texture.repeat.copy(this.node.pv.repeat);
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	private _update_rotation(texture: Texture, update_matrix: boolean) {
		texture.rotation = this.node.pv.rotation;
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	private _update_center(texture: Texture, update_matrix: boolean) {
		texture.center.copy(this.node.pv.center);
		if (update_matrix) {
			texture.updateMatrix();
		}
	}
	static PARAM_CALLBACK_update_offset(node: TextureCopNode) {
		const texture = node.container_controller.container.texture();
		node.texture_params_controller._update_offset(texture, true);
	}
	static PARAM_CALLBACK_update_repeat(node: TextureCopNode) {
		const texture = node.container_controller.container.texture();
		node.texture_params_controller._update_repeat(texture, true);
	}
	static PARAM_CALLBACK_update_rotation(node: TextureCopNode) {
		const texture = node.container_controller.container.texture();
		node.texture_params_controller._update_rotation(texture, true);
	}
	static PARAM_CALLBACK_update_center(node: TextureCopNode) {
		const texture = node.container_controller.container.texture();
		node.texture_params_controller._update_center(texture, true);
	}
}
