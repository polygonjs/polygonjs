import {VideoTexture} from 'three/src/textures/VideoTexture';
import {TextureLoader} from 'three/src/loaders/TextureLoader';
import {Texture} from 'three/src/textures/Texture';
// import {RepeatWrapping} from 'three/src/constants';
// import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
// import lodash_isArray from 'lodash/isArray';
// import {CoreScriptLoader} from 'src/core/loader/Script';
// import {CoreGeometry} from 'src/core/geometry/Geometry';
import {CoreWalker} from 'src/core/Walker';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {BaseParamType} from 'src/engine/params/_Base';
import {BaseCopNodeClass} from 'src/engine/nodes/cop/_Base';
import {TextureContainer} from 'src/engine/containers/Texture';
import {POLY} from 'src/engine/Poly';
// import {BufferGeometry} from 'three/src/core/BufferGeometry';

interface VideoSourceTypeByExt {
	ogg: string;
	ogv: string;
	mp4: string;
}
interface ImageScriptUrlByExt {
	exr: string;
	basis: string;
}
interface ThreeLoaderByExt {
	exr: string;
	basis: string;
}

enum Extension {
	EXR = 'exr',
	BASIS = 'basis',
}

export class CoreTextureLoader {
	static PARAM_DEFAULT = '/examples/textures/uv.jpg';
	static PARAM_ENV_DEFAULT = '/examples/textures/piz_compressed.exr';

	static VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv'];
	static VIDEO_SOURCE_TYPE_BY_EXT: VideoSourceTypeByExt = {
		ogg: 'video/ogg; codecs="theora, vorbis"',
		ogv: 'video/ogg; codecs="theora, vorbis"',
		mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
	};
	static SCRIPT_URL_BY_EXT: ImageScriptUrlByExt = {
		exr: 'EXRLoader',
		basis: 'BasisTextureLoader',
	};
	static THREE_LOADER_BY_EXT: ThreeLoaderByExt = {
		exr: 'EXRLoader',
		basis: 'BasisTextureLoader',
	};
	// @load_texture: (url, callback)->
	// 	if url
	// 		loader = this._texture_loader(url)

	// 		loader.load(
	// 			url,
	// 			callback,
	// 			null,
	// 			(error)=>
	// 				this.set_error("could not load texture #{url}")
	// 				#this._on_error(error)
	// 			)
	// 	else
	// 		this.set_error("not url given to Mat/Base._load_texture")
	// _on_error: (error)->
	// 	console.log("ERROR")
	// 	console.log(error)
	// 	this.set_error_message()

	constructor(private _node: BaseNodeType, private _param: BaseParamType) {}

	async load_texture_from_url_or_op(url: string): Promise<Texture | VideoTexture | null> {
		let texture: Texture | null = null;
		let found_node;

		if (url.substring(0, 3) == 'op:') {
			const node_path = url.substring(3);
			found_node = CoreWalker.find_node(this._node, node_path);
			if (found_node) {
				if (found_node instanceof BaseCopNodeClass) {
					const container: TextureContainer = await found_node.request_container();
					texture = container.texture();
				} else {
					this._node.states.error.set(`found node is not a texture node`);
				}

				// this._assign_texture(attrib, texture)
			} else {
				this._node.states.error.set(`no node found in path '${node_path}'`);
			}
		} else {
			texture = await this.load_url(url);
			if (texture) {
				// param.mark_as_referencing_asset(url)
				if (this._param.options.texture_as_env()) {
					// texture = await CoreTextureLoader.set_texture_for_env(texture, this._node);
				} else {
					texture = CoreTextureLoader.set_texture_for_mapping(texture);
				}
			} else {
				this._node.states.error.set(`could not load texture ${url}`);
			}
		}

		// NOTE: if this._param gets its value from an expression like `ch('/CONTROL/photo_url')`
		// then found_node will be null, so the graph should not be changed
		if (found_node && this._param.graph_predecessors()[0] != found_node) {
			this._param.graph_disconnect_predecessors();
			this._param.add_graph_input(found_node);
		}

		// this._assign_texture(attrib, texture)
		return texture;
	}

	async load_url(url: string): Promise<Texture> {
		return new Promise(async (resolve, reject) => {
			// url = this._resolve_url(url)
			const ext = CoreTextureLoader._ext(url);

			if (CoreTextureLoader.VIDEO_EXTENSIONS.includes(ext)) {
				const texture: VideoTexture = await this._load_as_video(url);
				return texture;
			} else {
				this.loader_for_ext(ext).then((loader) => {
					console.log('loader', loader);
					loader.load(url, resolve, undefined, (error: any) => {
						console.warn('error', error);
						reject();
					});
				});
			}
		});
	}

	async loader_for_ext(ext: string) {
		const ext_lowercase = ext.toLowerCase() as keyof ThreeLoaderByExt;
		// const script_name = CoreTextureLoader.SCRIPT_URL_BY_EXT[ext_lowercase];
		// var loader;

		switch (ext_lowercase) {
			case Extension.EXR: {
				const {EXRLoader} = await import('modules/three/examples/jsm/loaders/EXRLoader');
				return new EXRLoader();
			}
			case Extension.BASIS: {
				const {BasisTextureLoader} = await import('modules/three/examples/jsm/loaders/BasisTextureLoader');
				const loader = new BasisTextureLoader();
				loader.setTranscoderPath('/three/js/libs/basis/');
				const renderer = POLY.renderers_controller.first_renderer();
				if (renderer) {
					loader.detectSupport(renderer);
				} else {
					console.warn('texture loader found no renderer for basis texture loader');
				}
				return loader;
			}
		}

		// if (script_name) {
		// const imported_classes = await CoreScriptLoader.load_module_three_loader(script_name)
		// const imported_classes = await CoreScriptLoader.three_module(`loaders/${script_name}`);
		// const imported_classes = await import(`modules/three/examples/jsm/loaders/${script_name}`);
		// const loader_class_name = CoreTextureLoader.THREE_LOADER_BY_EXT[ext_lowercase];
		// const loader_class = imported_classes[loader_class_name];
		// if (loader_class) {
		// 	loader = new loader_class();
		// 	if (ext == 'basis') {
		// 		loader.setTranscoderPath('/three/js/libs/basis/');
		// 		const renderer = POLY.renderers_controller.first_renderer();
		// 		loader.detectSupport(renderer);
		// 	}
		// }
		// }
		return new TextureLoader();

		// const constructor = (() => { switch (ext) {
		// 	case 'exr': return EXRLoader;
		// 	default: return TextureLoader;
		// } })();
		// return new constructor();
	}

	_load_as_video(url: string): Promise<VideoTexture> {
		return new Promise((resolve, reject) => {
			const video = document.createElement('video');
			// document.body.appendChild(video)
			// video.id = 'video'
			// console.log("video", video)
			video.setAttribute('crossOrigin', 'anonymous');
			video.setAttribute('autoplay', `${true}`); // to ensure it loads
			video.setAttribute('loop', `${true}`);

			// wait for onloadedmetadata to ensure that we have a duration
			video.onloadedmetadata = function() {
				video.pause();
				const texture = new VideoTexture(video);
				resolve(texture);
			};
			// video.setAttribute('controls', true)
			// video.style="display:none"
			const source = document.createElement('source');
			const ext = CoreTextureLoader._ext(url) as keyof VideoSourceTypeByExt;
			let type: string = CoreTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[ext];
			type = type || CoreTextureLoader._default_video_source_type(url);
			source.setAttribute('type', type);
			source.setAttribute('src', url);

			video.appendChild(source);
		});
	}
	static _default_video_source_type(url: string) {
		const ext = this._ext(url);
		return `video/${ext}`;
	}

	static pixel_data(texture: Texture) {
		const img = texture.image;
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext('2d');
		if (context) {
			context.drawImage(img, 0, 0, img.width, img.height);
			return context.getImageData(0, 0, img.width, img.height);
		}
	}

	// TODO: typescript: check what type the pixel_data is
	// static pixel_data_to_attribute(pixel_data: Pixel, geometry: BufferGeometry, attrib_name_with_component:string, convert_method: (x:number, y:number, z:number, w:number)=>number) {
	// 	const {data} = pixel_data;
	// 	const geometry_wrapper = new CoreGeometry(geometry);
	// 	// TODO: add error if no uvs
	// 	const values = [];
	// 	const points = geometry_wrapper.points();
	// 	for (let point of points) {
	// 		const uv = point.attrib_value('uv');
	// 		const x = Math.floor((pixel_data.width - 1) * uv.x);
	// 		const y = Math.floor((pixel_data.height - 1) * (1 - uv.y));
	// 		const i = y * pixel_data.width + x;
	// 		// const val = data[4*i] / 255.0;
	// 		if (convert_method) {
	// 			const val = convert_method(data[4 * i + 0], data[4 * i + 1], data[4 * i + 2], data[4 * i + 3]);
	// 			values.push(val);
	// 		} else {
	// 			values.push([data[4 * i + 0], data[4 * i + 1], data[4 * i + 2]]);
	// 		}
	// 	}

	// 	const attrib_name_elements = attrib_name_with_component.split('.');
	// 	let attrib_name = attrib_name_elements[0];
	// 	let component_offset = null;
	// 	if (attrib_name_elements.length > 1) {
	// 		const component = attrib_name_elements[1] as keyof Vector4Like
	// 		component_offset = {x: 0, y: 1, z: 2, w: 3}[component];
	// 	}

	// 	let attrib = geometry.attributes[attrib_name];
	// 	if (attrib) {
	// 		const array = attrib.array;
	// 		let index = 0;
	// 		let is_array = null;
	// 		for (let value of values) {
	// 			if (is_array || lodash_isArray(value)) {
	// 				is_array = true;
	// 				let component_index = 0;
	// 				for (let value_c of value) {
	// 					array[attrib.itemSize * index + component_index] = value_c;
	// 					component_index++;
	// 				}
	// 			} else {
	// 				array[attrib.itemSize * index + component_offset] = value;
	// 			}
	// 			index++;
	// 		}
	// 	} else {
	// 		attrib = geometry.setAttribute(attrib_name, new Float32BufferAttribute(values, 1));
	// 	}
	// 	attrib.needsUpdate = true;
	// }

	static _ext(url: string) {
		const elements = url.split('.');
		return elements[elements.length - 1].toLowerCase();
	}
	// static private _resolve_url(url: string):string{
	// 	if(url[0] == '/'){
	// 		const root_url = POLY.env_is_production() ? 'https://polygonjs.com' : 'http://localhost:5000'
	// 		url = `${root_url}${url}`
	// 	}
	// 	return url
	// }

	static set_texture_for_mapping(texture: Texture) {
		// let val = texture['wrapS']
		// Object.defineProperty(texture, 'wrapS', {
		// 	get () {
		// 		return val // Simply return the cached value
		// 	},
		// 	set (newVal) {
		// 		val = newVal // Save the newVal
		// 		console.warn("set", newVal)
		// 	}
		// })

		// texture.wrapS = RepeatWrapping
		// texture.wrapT = RepeatWrapping
		// console.log("set_texture_for_mapping", RepeatWrapping, texture, texture.wrapS)
		return texture;
	}

	// static async set_texture_for_env(texture: Texture, registerer: BaseNode) {
	// 	if (registerer._registered_env_map) {
	// 		POLY.renderers_controller.deregister_env_map(registerer._registered_env_map);
	// 	}
	// 	registerer._registered_env_map = await POLY.renderers_controller.register_env_map(texture);
	// 	return registerer._registered_env_map;
	// }
}
