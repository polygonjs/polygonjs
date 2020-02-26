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

import {TypedCopNode} from './_Base';
// import {BaseParam} from '../../../Engine/Param/_Base'
import {CoreTextureLoader} from '../../../core/loader/Texture';
import {ParamType} from '../../poly/ParamType';
import {NodeEvent} from '../../poly/NodeEvent';

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
	wrapT: 'wrap_t',
	minFilter: 'min_filter',
	magFilter: 'mag_filter',
	// type: 'type',
	// encoding: 'encoding'
	// format: 'format',
};

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class FileCopParamsConfig extends NodeParamsConfig {
	// video_time = ParamConfig.FLOAT(1);
	url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
		desktop_browse: {file_type: 'texture'},
	});
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			FileCopNode.PARAM_CALLBACK_reload(node as FileCopNode, param);
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
			// type: 'radio',
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
			// type: 'radio',
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
			// type: 'radio',
			entries: MAG_FILTERS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	min_filter = ParamConfig.INTEGER(Object.values(MIN_FILTERS[0])[0], {
		menu: {
			// type: 'radio',
			entries: MIN_FILTERS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
}

const ParamsConfig = new FileCopParamsConfig();

export class FileCopNode extends TypedCopNode<FileCopParamsConfig> {
	params_config = ParamsConfig;
	// @ParamF('video_time') _param_video_time: number;
	// @ParamS('url') _param_url: string;
	private _previous_param_url: string | undefined;
	private _video: HTMLVideoElement | undefined;

	static type() {
		return 'file';
	}

	// _param_video_time_param: BaseParam
	private _texture_loader: CoreTextureLoader | undefined;

	static VIDEO_TIME_PARAM_NAME = 'video_time';
	static DEFAULT_NODE_PATH = {
		UV: '/COP/file_uv',
		ENV_MAP: '/COP/env_map',
	};

	// initialize_node() {
	// 	// this.io.inputs.set_count_to_zero();
	// }

	// create_params() {
	// 	// this.add_param(ParamType.STRING, 'url', CoreTextureLoader.PARAM_DEFAULT, {
	// 	// 	desktop_browse: {file_type: 'texture'},
	// 	// });
	// 	// this.add_param(ParamType.BUTTON, 'reload', null, {
	// 	// 	callback: this._reload.bind(this),
	// 	// });
	// 	// this.add_param(ParamType.FLOAT, 'video_time', 0, {range: [0, 10]})
	// 	// this.add_param(ParamType.INTEGER, 'mapping', UVMapping as number, {
	// 	// 	menu: {
	// 	// 		entries: MAPPINGS.map((m) => {
	// 	// 			return {
	// 	// 				name: Object.keys(m)[0],
	// 	// 				value: Object.values(m)[0] as number,
	// 	// 			};
	// 	// 		}),
	// 	// 	},
	// 	// });
	// 	// for (let wrap_name of ['wrap_s', 'wrap_t']) {
	// 	// 	const wrap = Object.values(WRAPPINGS[0])[0] as number;
	// 	// 	this.add_param(ParamType.INTEGER, wrap_name, wrap, {
	// 	// 		menu: {
	// 	// 			// type: 'radio',
	// 	// 			entries: WRAPPINGS.map((m) => {
	// 	// 				return {
	// 	// 					name: Object.keys(m)[0],
	// 	// 					value: Object.values(m)[0] as number,
	// 	// 				};
	// 	// 			}),
	// 	// 		},
	// 	// 	});
	// 	// }
	// 	// const mag_filter = Object.values(MAG_FILTERS[0])[0] as number;
	// 	// this.add_param(ParamType.INTEGER, 'mag_filter', mag_filter, {
	// 	// 	menu: {
	// 	// 		// type: 'radio',
	// 	// 		entries: MAG_FILTERS.map((m) => {
	// 	// 			return {
	// 	// 				name: Object.keys(m)[0],
	// 	// 				value: Object.values(m)[0] as number,
	// 	// 			};
	// 	// 		}),
	// 	// 	},
	// 	// });
	// 	// const min_filter: number = Object.values(MIN_FILTERS[0])[0] as number;
	// 	// this.add_param(ParamType.INTEGER, 'min_filter', min_filter, {
	// 	// 	menu: {
	// 	// 		// type: 'radio',
	// 	// 		entries: MIN_FILTERS.map((m) => {
	// 	// 			return {
	// 	// 				name: Object.keys(m)[0],
	// 	// 				value: Object.values(m)[0] as number,
	// 	// 			};
	// 	// 		}),
	// 	// 	},
	// 	// });
	// 	// TODO: to be added when I have some level of control
	// 	// for now, the type attribute overrides what piz_compressed.exr creates
	// 	// which in turns fucks up with the env_map
	// 	// advanced
	// 	// this.add_param(ParamType.TOGGLE, 'advanced', 0)
	// 	// this.add_param(ParamType.INTEGER, 'type', THREE[TYPES[0]], {
	// 	// 	menu: { type: 'radio', entries: TYPES.map(m=>{ return { name: m, value: THREE[m] } })},
	// 	// 	visible_if: {advanced: 1}
	// 	// })
	// 	// this.add_param(ParamType.INTEGER, 'format', THREE[FORMATS[0]], {
	// 	// 	menu: { type: 'radio', entries: FORMATS.map(m=>{ return { name: m, value: THREE[m] } })},
	// 	// 	visible_if: {advanced: 1}
	// 	// })
	// 	// this.add_param(ParamType.INTEGER, 'encoding', THREE[ENCODINGS[0]], {
	// 	// 	menu: { type: 'radio', entries: ENCODINGS.map(m=>{ return { name: m, value: THREE[m] } })},
	// 	// 	visible_if: {advanced: 1}
	// 	// })
	// }

	async cook() {
		if (this._is_static_image_url(this.pv.url)) {
			await this.cook_for_image();
		} else {
			await this.cook_for_video();
		}
	}

	private _is_static_image_url(url: string) {
		return true;
	}

	private async cook_for_image() {
		const texture = await this._load_texture(this.pv.url);

		if (texture) {
			this._update_texture_params(texture);
			this.set_texture(texture);
		} else {
			this.clear_texture();
		}
	}

	private async cook_for_video() {
		if (this._param_url_changed()) {
			const texture = await this._load_texture(this.pv.url);
			// if (texture) {
			// 	this._texture = texture;
			// }

			if (texture) {
				this._add_video_spare_params_if_required(texture);
			}
			this._previous_param_url = this.pv.url;

			this._set_video_current_time();

			if (texture) {
				this._update_texture_params(texture);
				this.set_texture(texture);
			} else {
				this.cook_controller.end_cook();
			}
		} else {
			// this._set_video_current_time();
			// this._update_texture_params();
			// if (texture?.needsUpdate) {
			// 	this.set_texture(texture);
			// } else {
			// 	this.cook_controller.end_cook();
			// }
		}
	}

	resolved_url() {
		return this.pv.url;
	}

	private _update_texture_params(texture: Texture) {
		// const keys = Object.keys(ATTRIB_MAPPING) as keyof AttribMapping
		for (let texture_attrib of ATTRIB_MAPPING_KEYS) {
			const param_name = ATTRIB_MAPPING[texture_attrib];
			const param_value = this.params.float(param_name);
			// const texture_attrib = ATTRIB_MAPPING[attrib];

			if (param_value != null && texture) {
				if (texture[texture_attrib] != param_value) {
					texture[texture_attrib] = param_value;
					texture.needsUpdate = true;
				}
			}
		}
	}
	static PARAM_CALLBACK_reload(node: FileCopNode, param: BaseParamType) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		this._previous_param_url = undefined;

		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.p.url.set_successors_dirty();
		// this.set_dirty()
	}

	private _set_video_current_time() {
		if (this._video) {
			if (this.params.has('video_time')) {
				this._video.currentTime = this.params.float('video_time');
			}
		}
	}

	private _add_video_spare_params_if_required(texture: Texture | VideoTexture | null) {
		if (texture) {
			const is_video = texture.constructor == VideoTexture;
			if (is_video) {
				this._video = texture.image;
				if (this._video) {
					if (!this.params.has_param(FileCopNode.VIDEO_TIME_PARAM_NAME)) {
						const duration = this._video.duration;

						this.add_param(ParamType.FLOAT, FileCopNode.VIDEO_TIME_PARAM_NAME, '$T', {
							spare: true,
							cook: true,
							range: [0, duration],
							range_locked: [true, true],
						});

						this.emit(NodeEvent.PARAMS_UPDATED);
					}
				}
			} else {
				this._remove_spare_params();
			}
		} else {
			this._remove_spare_params();
		}
	}

	private _remove_spare_params() {
		if (this.params.has_param(FileCopNode.VIDEO_TIME_PARAM_NAME)) {
			this.params.delete_param(FileCopNode.VIDEO_TIME_PARAM_NAME);
			this.emit(NodeEvent.PARAMS_UPDATED);
		}
	}

	private _param_url_changed(): boolean {
		return this._previous_param_url != this.pv.url;
	}

	private async _load_texture(url: string) {
		let texture: Texture | VideoTexture | null = null;
		const param = this.params.get('url');
		if (url && param) {
			this._texture_loader = this._texture_loader || new CoreTextureLoader(this, param);
			// const ext = lodash_last(url.split('.')).toLowerCase()
			try {
				texture = await this._texture_loader.load_texture_from_url_or_op(url);
			} catch (e) {
				//console.log('FAIL');
			}
			// if(texture){
			// 	callback(texture)
			// } else {
			if (!texture) {
				this.states.error.set(`could not load texture '${url}'`);
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
