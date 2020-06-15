import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import lodash_isNumber from 'lodash/isNumber';
import {
	UVMapping,
	CubeReflectionMapping,
	CubeRefractionMapping,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	SphericalReflectionMapping,
	CubeUVReflectionMapping,
	CubeUVRefractionMapping,
	ClampToEdgeWrapping,
	RepeatWrapping,
	MirroredRepeatWrapping,
	LinearFilter,
	NearestFilter,
	NearestMipMapNearestFilter,
	NearestMipMapLinearFilter,
	LinearMipMapNearestFilter,
	LinearMipMapLinearFilter,
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

const MAPPINGS = [
	{UVMapping},
	{CubeReflectionMapping},
	{CubeRefractionMapping},
	{EquirectangularReflectionMapping},
	{EquirectangularRefractionMapping},
	{SphericalReflectionMapping},
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

const MAG_FILTERS: Dictionary<number>[] = [{LinearFilter}, {NearestFilter}];
const MIN_FILTERS: Dictionary<number>[] = [
	{NearestFilter},
	{NearestMipMapNearestFilter},
	{NearestMipMapLinearFilter},
	{LinearFilter},
	{LinearMipMapNearestFilter},
	{LinearMipMapLinearFilter},
];

// const TYPES = [
// 	"UnsignedByteType",
// 	"ByteType",
// 	"ShortType",
// 	"UnsignedShortType",
// 	"IntType",
// 	"UnsignedIntType",
// 	"FloatType",
// 	"HalfFloatType",
// 	"UnsignedShort4444Type",
// 	"UnsignedShort5551Type",
// 	"UnsignedShort565Type",
// 	"UnsignedInt248Type"
// ];

// const FORMATS = [
// 	'AlphaFormat',
// 	'RGBFormat',
// 	'RGBAFormat',
// 	'LuminanceFormat',
// 	'LuminanceAlphaFormat',
// 	'RGBEFormat',
// 	'DepthFormat',
// 	'DepthStencilFormat',
// ];

// const ENCODINGS = [
// 	"LinearEncoding",
// 	"sRGBEncoding",
// 	"GammaEncoding",
// 	"RGBEEncoding",
// 	"LogLuvEncoding",
// 	"RGBM7Encoding",
// 	"RGBM16Encoding",
// 	"RGBDEncoding",
// 	"BasicDepthPacking",
// 	"RGBADepthPacking"
// ];

interface AttribMapping {
	encoding: string;
	mapping: string;
	wrapS: string;
	wrapT: string;
	minFilter: string;
	magFilter: string;
}
const ATTRIB_MAPPING_KEYS: Array<keyof AttribMapping> = [
	'encoding',
	'mapping',
	'wrapS',
	'wrapT',
	'minFilter',
	'magFilter',
];
const ATTRIB_MAPPING: AttribMapping = {
	encoding: 'encoding',
	mapping: 'mapping',
	wrapS: 'wrap_s',
	wrapT: 'wrap_t',
	minFilter: 'min_filter',
	magFilter: 'mag_filter',

	// type: 'type',
	// encoding: 'encoding'
	// format: 'format',
};

interface TextureWithUpdateMatrix extends Texture {
	updateMatrix(): void;
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

export function TexturePropertiesParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		encoding = ParamConfig.INTEGER(LinearEncoding, {
			menu: {
				entries: ENCODINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		mapping = ParamConfig.INTEGER(UVMapping, {
			menu: {
				entries: MAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		wrap_s = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		wrap_t = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		mag_filter = ParamConfig.INTEGER(Object.values(MAG_FILTERS[0])[0], {
			menu: {
				entries: MAG_FILTERS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		min_filter = ParamConfig.INTEGER(Object.values(MIN_FILTERS[5])[0], {
			menu: {
				entries: MIN_FILTERS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		flip_y = ParamConfig.BOOLEAN(0);
		offset = ParamConfig.VECTOR2([0, 0]);
		repeat = ParamConfig.VECTOR2([1, 1]);
		rotation = ParamConfig.FLOAT(0, {
			range: [-1, 1],
		});
		center = ParamConfig.VECTOR2([0, 0]);
	};
}

class TexturePropertiesCopParamsConfig extends TexturePropertiesParamConfig(NodeParamsConfig) {}

const ParamsConfig = new TexturePropertiesCopParamsConfig();

export class TexturePropertiesCopNode extends TypedCopNode<TexturePropertiesCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'texture_properties';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE]);
	}
	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this._update_texture_params(texture);
		this.set_texture(texture);
	}
	private _update_texture_params(texture: Texture) {
		TexturePropertiesCopNode.update_texture_params(this, texture);
	}

	static update_texture_params(node: TexturePropertiesCopNode, texture: Texture) {
		for (let texture_attrib of ATTRIB_MAPPING_KEYS) {
			const param_name = ATTRIB_MAPPING[texture_attrib];
			const param = node.params.param(param_name);

			if (param && texture) {
				const param_value = param.value;
				if (param_value != null && lodash_isNumber(param_value)) {
					if (texture[texture_attrib] != param_value) {
						texture[texture_attrib] = param_value;
						texture.needsUpdate = true;
					}
				}
			}
		}
		texture.flipY = node.pv.flip_y;
		TexturePropertiesCopNode.update_texture_transform(node, texture);
	}
	static update_texture_transform(node: TexturePropertiesCopNode, texture: Texture) {
		texture.offset.copy(node.pv.offset);
		texture.repeat.copy(node.pv.repeat);
		texture.rotation = node.pv.rotation;
		texture.center.copy(node.pv.center);

		(texture as TextureWithUpdateMatrix).updateMatrix();
	}
}
