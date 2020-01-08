import {VideoTexture} from 'three/src/textures/VideoTexture';
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
	// LinearEncoding,
	// sRGBEncoding,
	// GammaEncoding,
	// RGBEEncoding,
	// LogLuvEncoding,
	// RGBM7Encoding,
	// RGBM16Encoding,
	// RGBDEncoding,
	// BasicDepthPacking,
	// RGBADepthPacking,
} from 'three/src/constants';
import {Texture} from 'three/src/textures/Texture';
// const THREE = {
// 	Texture,
// 	UVMapping,
// 	VideoTexture,
// 	CubeReflectionMapping,
// 	CubeRefractionMapping,
// 	EquirectangularReflectionMapping,
// 	EquirectangularRefractionMapping,
// 	SphericalReflectionMapping,
// 	CubeUVReflectionMapping,
// 	CubeUVRefractionMapping,
// 	ClampToEdgeWrapping,
// 	RepeatWrapping,
// 	MirroredRepeatWrapping,
// 	LinearFilter,
// 	NearestFilter,
// 	NearestMipMapNearestFilter,
// 	NearestMipMapLinearFilter,
// 	LinearMipMapNearestFilter,
// 	LinearMipMapLinearFilter,
// 	UnsignedByteType,
// 	ByteType,
// 	ShortType,
// 	UnsignedShortType,
// 	IntType,
// 	UnsignedIntType,
// 	FloatType,
// 	HalfFloatType,
// 	UnsignedShort4444Type,
// 	UnsignedShort5551Type,
// 	UnsignedShort565Type,
// 	UnsignedInt248Type,
// 	AlphaFormat,
// 	RGBFormat,
// 	RGBAFormat,
// 	LuminanceFormat,
// 	LuminanceAlphaFormat,
// 	RGBEFormat,
// 	DepthFormat,
// 	DepthStencilFormat,
// 	LinearEncoding,
// 	sRGBEncoding,
// 	GammaEncoding,
// 	RGBEEncoding,
// 	LogLuvEncoding,
// 	RGBM7Encoding,
// 	RGBM16Encoding,
// 	RGBDEncoding,
// 	BasicDepthPacking,
// 	RGBADepthPacking,
// };
// import lodash_last from 'lodash/last';
// import NodeBase from '../_Base'

import {BaseCopNode} from './_Base';
// import {BaseParam} from 'src/Engine/Param/_Base'
import {CoreTextureLoader} from 'src/core/loader/Texture';

// this used to be named file_in, but I can't recall the decision of not calling it simply 'file'
// so renaming it back to file for now

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

const WRAPPINGS = [{ClampToEdgeWrapping}, {RepeatWrapping}, {MirroredRepeatWrapping}];

const MAG_FILTERS = [{LinearFilter}, {NearestFilter}];
const MIN_FILTERS = [
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
// 	"AlphaFormat",
// 	"RGBFormat",
// 	"RGBAFormat",
// 	"LuminanceFormat",
// 	"LuminanceAlphaFormat",
// 	"RGBEFormat",
// 	"DepthFormat",
// 	"DepthStencilFormat"
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
	mapping: string;
	wrapS: string;
	wrapT: string;
	minFilter: string;
	magFilter: string;
}
const ATTRIB_MAPPING_KEYS: Array<keyof AttribMapping> = ['mapping', 'wrapS', 'wrapT', 'minFilter', 'magFilter'];
const ATTRIB_MAPPING: AttribMapping = {
	mapping: 'mapping',
	wrapS: 'wrap_s',
	wrapT: 'wrap_T',
	minFilter: 'min_filter',
	magFilter: 'mag_filter',
	// type: 'type',
	// encoding: 'encoding'
	// format: 'format',
};

export class FileCopNode extends BaseCopNode {
	@ParamF('video_time') _param_video_time: number;
	@ParamS('url') _param_url: string;
	private _previous_param_url: string;
	private _video: HTMLVideoElement;

	static type() {
		return 'file';
	}

	// _param_video_time_param: BaseParam
	private _texture_loader: CoreTextureLoader;
	private _texture: Texture;

	static VIDEO_TIME_PARAM_NAME = 'video_time';
	static DEFAULT_NODE_PATH = {
		UV: '/COP/file_uv',
		ENV_MAP: '/COP/env_map',
	};

	constructor() {
		super();

		this.io.inputs.set_count_to_zero();
	}

	create_params() {
		this.add_param(ParamType.STRING, 'url', CoreTextureLoader.PARAM_DEFAULT, {
			desktop_browse: {file_type: 'texture'},
		});
		this.add_param(ParamType.BUTTON, 'reload', null, {
			callback: this._reload.bind(this),
		});

		// this.add_param(ParamType.FLOAT, 'video_time', 0, {range: [0, 10]})
		this.add_param(ParamType.INTEGER, 'mapping', UVMapping, {
			menu: {
				type: 'radio',
				entries: MAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0],
					};
				}),
			},
		});
		for (let wrap_name of ['wrap_s', 'wrap_t']) {
			this.add_param(ParamType.INTEGER, wrap_name, Object.values(WRAPPINGS[0])[0], {
				menu: {
					type: 'radio',
					entries: WRAPPINGS.map((m) => {
						return {
							name: Object.keys(m)[0],
							value: Object.values(m)[0],
						};
					}),
				},
			});
		}

		this.add_param(ParamType.INTEGER, 'mag_filter', Object.values(MAG_FILTERS[0])[0], {
			menu: {
				type: 'radio',
				entries: MAG_FILTERS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0],
					};
				}),
			},
		});
		this.add_param(ParamType.INTEGER, 'min_filter', Object.values(MIN_FILTERS[0])[0], {
			menu: {
				type: 'radio',
				entries: MIN_FILTERS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0],
					};
				}),
			},
		});

		// TODO: to be added when I have some level of control
		// for now, the type attribute overrides what piz_compressed.exr creates
		// which in turns fucks up with the env_map
		// advanced
		// this.add_param(ParamType.TOGGLE, 'advanced', 0)
		// this.add_param(ParamType.INTEGER, 'type', THREE[TYPES[0]], {
		// 	menu: { type: 'radio', entries: TYPES.map(m=>{ return { name: m, value: THREE[m] } })},
		// 	visible_if: {advanced: 1}
		// })
		// this.add_param(ParamType.INTEGER, 'format', THREE[FORMATS[0]], {
		// 	menu: { type: 'radio', entries: FORMATS.map(m=>{ return { name: m, value: THREE[m] } })},
		// 	visible_if: {advanced: 1}
		// })
		// this.add_param(ParamType.INTEGER, 'encoding', THREE[ENCODINGS[0]], {
		// 	menu: { type: 'radio', entries: ENCODINGS.map(m=>{ return { name: m, value: THREE[m] } })},
		// 	visible_if: {advanced: 1}
		// })
	}

	async cook() {
		if (this._param_url_changed()) {
			this._texture = await this._load_texture(this._param_url);

			this._add_video_spare_params_if_required(this._texture);
			this._previous_param_url = this._param_url;

			this._set_video_current_time();
			this._update_texture_params();

			this.set_texture(this._texture);
		} else {
			this._set_video_current_time();
			this._update_texture_params();

			if (this._texture.needsUpdate) {
				this.set_texture(this._texture);
			} else {
				this.cook_controller.end_cook();
			}
		}
	}

	resolved_url() {
		return this._param_url;
	}

	private _update_texture_params() {
		// const keys = Object.keys(ATTRIB_MAPPING) as keyof AttribMapping
		for (let texture_attrib of ATTRIB_MAPPING_KEYS) {
			const param_name = ATTRIB_MAPPING[texture_attrib];
			const param_value = this.params.float(param_name);
			// const texture_attrib = ATTRIB_MAPPING[attrib];

			if (param_value != null) {
				if (this._texture[texture_attrib] != param_value) {
					this._texture[texture_attrib] = param_value;
					this._texture.needsUpdate = true;
				}
			}
		}
	}

	private _reload() {
		this._previous_param_url = null;

		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.params.get('url').set_dirty();
		// this.set_dirty()
	}

	private _set_video_current_time() {
		if (this._video) {
			if (this._param_video_time) {
				this._video.currentTime = this._param_video_time;
			}
		}
	}

	private _add_video_spare_params_if_required(texture: Texture | VideoTexture) {
		if (texture) {
			const is_video = texture.constructor == VideoTexture;
			if (is_video) {
				this._video = texture.image;
				if (!this.params.has_param(File.VIDEO_TIME_PARAM_NAME)) {
					const duration = this._video.duration;

					this.add_param(ParamType.FLOAT, File.VIDEO_TIME_PARAM_NAME, '$T', {
						spare: true,
						cook: true,
						range: [0, duration],
						range_locked: [true, true],
					});

					this.emit('params_updated');
				}
			} else {
				this._remove_spare_params();
			}
		} else {
			this._remove_spare_params();
		}
	}

	private _remove_spare_params() {
		if (this.params.has_param(File.VIDEO_TIME_PARAM_NAME)) {
			this.params.delete_param(File.VIDEO_TIME_PARAM_NAME);
			this.emit('params_updated');
		}
	}

	private _param_url_changed(): boolean {
		return this._previous_param_url != this._param_url;
	}

	private async _load_texture(url: string) {
		this._texture_loader = this._texture_loader || new CoreTextureLoader(this, this.params.get('url'));

		let texture;
		if (url) {
			// const ext = lodash_last(url.split('.')).toLowerCase()
			texture = await this._texture_loader.load_texture_from_url_or_op(url);
			// if(texture){
			// 	callback(texture)
			// } else {
			if (!texture) {
				this.states.error.set(`could not load texture ${url}`);
			}
			// }).catch(error=>{
			// 	this.self.set_error(`could not load texture ${url} (${error})`);
			// })
		} else {
			this.states.error.set('not url given to Mat/Base._load_texture');
		}
		return texture;
	}
}
