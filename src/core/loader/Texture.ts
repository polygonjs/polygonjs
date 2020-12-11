import {VideoTexture} from 'three/src/textures/VideoTexture';
import {TextureLoader} from 'three/src/loaders/TextureLoader';
import {Texture} from 'three/src/textures/Texture';
import {UnsignedByteType} from 'three/src/constants';
import {CoreWalker} from '../Walker';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';
import {BaseCopNodeClass} from '../../engine/nodes/cop/_Base';
import {TextureContainer} from '../../engine/containers/Texture';
import {Poly} from '../../engine/Poly';
import {ModuleName} from '../../engine/poly/registers/modules/_BaseRegister';
import {CoreUserAgent} from '../UserAgent';

interface VideoSourceTypeByExt {
	ogg: string;
	ogv: string;
	mp4: string;
}
// interface ImageScriptUrlByExt {
// 	exr: string;
// 	basis: string;
// }
interface ThreeLoaderByExt {
	exr: string;
	basis: string;
	hdr: string;
}

enum Extension {
	EXR = 'exr',
	BASIS = 'basis',
	HDR = 'hdr',
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
			const ext = CoreTextureLoader.get_extension(url);
			if (url[0] != 'h') {
				const assets_root = this._node.scene.assets_controller.assets_root();
				if (assets_root) {
					url = `${assets_root}${url}`;
				}
			}

			if (CoreTextureLoader.VIDEO_EXTENSIONS.includes(ext)) {
				const texture: VideoTexture = await this._load_as_video(url);
				resolve(texture);
			} else {
				this.loader_for_ext(ext).then(async (loader) => {
					if (loader) {
						CoreTextureLoader.increment_in_progress_loads_count();
						await CoreTextureLoader.wait_for_max_concurrent_loads_queue_freed();
						loader.load(
							url,
							(texture: Texture) => {
								CoreTextureLoader.decrement_in_progress_loads_count();
								resolve(texture);
							},
							undefined,
							(error: any) => {
								CoreTextureLoader.decrement_in_progress_loads_count();
								Poly.warn('error', error);
								reject();
							}
						);
					} else {
						reject();
					}
				});
			}
		});
	}

	static module_names(ext: string): ModuleName[] | void {
		switch (ext) {
			case Extension.EXR:
				return [ModuleName.EXRLoader];
			case Extension.HDR:
				return [ModuleName.RGBELoader];
			case Extension.BASIS:
				return [ModuleName.BasisTextureLoader];
		}
	}

	async loader_for_ext(ext: string) {
		const ext_lowercase = ext.toLowerCase() as keyof ThreeLoaderByExt;
		switch (ext_lowercase) {
			case Extension.EXR: {
				return await this._exr_loader();
			}
			case Extension.HDR: {
				return await this._hdr_loader();
			}
			case Extension.BASIS: {
				return await this._basis_loader();
			}
		}
		return new TextureLoader();
	}

	private async _exr_loader() {
		const module = await Poly.instance().modulesRegister.module(ModuleName.EXRLoader);
		if (module) {
			return new module.EXRLoader();
		}
	}
	private async _hdr_loader() {
		const module = await Poly.instance().modulesRegister.module(ModuleName.RGBELoader);
		if (module) {
			const loader = new module.RGBELoader();
			loader.setDataType(UnsignedByteType);
			return loader;
		}
	}
	private async _basis_loader() {
		const module = await Poly.instance().modulesRegister.module(ModuleName.BasisTextureLoader);
		if (module) {
			const loader = new module.BasisTextureLoader();
			loader.setTranscoderPath('/three/js/libs/basis/');
			const renderer = await Poly.instance().renderers_controller.wait_for_renderer();
			if (renderer) {
				loader.detectSupport(renderer);
			} else {
				Poly.warn('texture loader found no renderer for basis texture loader');
			}
			return loader;
		}
	}

	_load_as_video(url: string): Promise<VideoTexture> {
		return new Promise((resolve, reject) => {
			const video = document.createElement('video');
			// document.body.appendChild(video)
			// video.id = 'video'
			video.setAttribute('crossOrigin', 'anonymous');
			video.setAttribute('autoplay', `${true}`); // to ensure it loads
			video.setAttribute('loop', `${true}`);

			// wait for onloadedmetadata to ensure that we have a duration
			video.onloadedmetadata = function () {
				video.pause();
				const texture = new VideoTexture(video);
				resolve(texture);
			};
			// video.setAttribute('controls', true)
			// video.style="display:none"

			// add source as is
			const original_source = document.createElement('source');
			const original_ext = CoreTextureLoader.get_extension(url) as keyof VideoSourceTypeByExt;
			let type: string = CoreTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[original_ext];
			type = type || CoreTextureLoader._default_video_source_type(url);
			original_source.setAttribute('type', type);
			original_source.setAttribute('src', url);
			video.appendChild(original_source);

			// add secondary source, either mp4 or ogv depending on the first url
			let secondary_url = url;
			if (original_ext == 'mp4') {
				// add ogv
				secondary_url = CoreTextureLoader.replace_extension(url, 'ogv');
			} else {
				// add mp4
				secondary_url = CoreTextureLoader.replace_extension(url, 'mp4');
			}
			const secondary_source = document.createElement('source');
			const secondary_ext = CoreTextureLoader.get_extension(secondary_url) as keyof VideoSourceTypeByExt;
			type = CoreTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[secondary_ext];
			type = type || CoreTextureLoader._default_video_source_type(url);
			secondary_source.setAttribute('type', type);
			secondary_source.setAttribute('src', url);
			video.appendChild(secondary_source);
		});
	}
	static _default_video_source_type(url: string) {
		const ext = this.get_extension(url);
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

	static get_extension(url: string) {
		const elements = url.split('.');
		return elements[elements.length - 1].toLowerCase();
	}
	static replace_extension(url: string, new_extension: string) {
		const elements = url.split('?');
		const url_without_params = elements[0];
		const url_elements = url_without_params.split('.');
		url_elements.pop();
		url_elements.push(new_extension);
		return [url_elements.join('.'), elements[1]].join('?');
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
		// 	}
		// })

		// texture.wrapS = RepeatWrapping
		// texture.wrapT = RepeatWrapping
		return texture;
	}

	// static async set_texture_for_env(texture: Texture, registerer: BaseNode) {
	// 	if (registerer._registered_env_map) {
	// 		POLY.renderers_controller.deregister_env_map(registerer._registered_env_map);
	// 	}
	// 	registerer._registered_env_map = await POLY.renderers_controller.register_env_map(texture);
	// 	return registerer._registered_env_map;
	// }

	//
	//
	// CONCURRENT LOADS
	//
	//
	private static MAX_CONCURRENT_LOADS_COUNT: number = CoreTextureLoader._init_max_concurrent_loads_count();
	private static CONCURRENT_LOADS_DELAY: number = CoreTextureLoader._init_concurrent_loads_delay();
	private static in_progress_loads_count: number = 0;
	private static _queue: Array<() => void> = [];
	private static _init_max_concurrent_loads_count(): number {
		return CoreUserAgent.is_chrome() ? 10 : 4;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // limit to 4 for non chrome,
		// // as firefox was seen hanging trying to load multiple glb files
		// // limit to 1 for safari,
		// if (name) {
		// 	const loads_count_by_browser: Dictionary<number> = {
		// 		Chrome: 10,
		// 		Firefox: 4,
		// 	};
		// 	const loads_count = loads_count_by_browser[name];
		// 	if (loads_count != null) {
		// 		return loads_count;
		// 	}
		// }
		// return 1;
	}
	private static _init_concurrent_loads_delay(): number {
		return CoreUserAgent.is_chrome() ? 0 : 10;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // add a delay for browsers other than Chrome and Firefox
		// if (name) {
		// 	const delay_by_browser: Dictionary<number> = {
		// 		Chrome: 0,
		// 		Firefox: 10,
		// 	};
		// 	const delay = delay_by_browser[name];
		// 	if (delay != null) {
		// 		return delay;
		// 	}
		// }
		// return 100;
	}
	public static override_max_concurrent_loads_count(count: number) {
		this.MAX_CONCURRENT_LOADS_COUNT = count;
	}

	private static increment_in_progress_loads_count() {
		this.in_progress_loads_count++;
	}
	private static decrement_in_progress_loads_count() {
		this.in_progress_loads_count--;

		const queued_resolve = this._queue.pop();
		if (queued_resolve) {
			const delay = this.CONCURRENT_LOADS_DELAY;
			setTimeout(() => {
				queued_resolve();
			}, delay);
		}
	}

	private static async wait_for_max_concurrent_loads_queue_freed() {
		if (this.in_progress_loads_count <= this.MAX_CONCURRENT_LOADS_COUNT) {
			return;
		} else {
			return new Promise((resolve) => {
				this._queue.push(resolve);
			});
		}
	}
}
