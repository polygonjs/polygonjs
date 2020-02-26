import {ObjectLoader} from 'three/src/loaders/ObjectLoader';
import {Object3D} from 'three/src/core/Object3D';
// import lodash_isArray from 'lodash/isArray';
// import {CoreString} from '../String';

// import {GeometryLoaderModule} from './Geometry/_Module';
// import {DRACOLoader} from './Geometry/DRACOLoader';
// import {JsonData} from './Geometry/JsonData'
// import {CoreScriptLoader} from './Script';
import axios from 'axios';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';

// import {DDSLoader} from '../../../modules/three/examples/jsm/loaders/DDSLoader';
// import {DRACOLoader} from '../../../modules/three/examples/jsm/loaders/DRACOLoader';
// import {GLTFLoader} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
// import {OBJLoader} from '../../../modules/three/examples/jsm/loaders/OBJLoader';

// const GLTFLoaders = ['DDSLoader', 'DRACOLoader', 'GLTFLoader'];
// const SCRIPT_URLS_BY_EXT = {
// 	gltf: GLTFLoaders,
// 	glb: GLTFLoaders,
// 	obj: 'OBJLoader',
// };
// const THREE_LOADER_BY_EXT = {
// 	gltf: 'GLTFLoader',
// 	glb: 'GLTFLoader',
// 	obj: 'OBJLoader',
// };
// const DRACO_EXTENSIONS = ['gltf', 'glb']
// const DRACO_EXTENSIONS = ['drc'];

// export enum LoaderType {
// 	AUTO = 'auto',
// 	JSON_DATA = 'json_data',
// 	// THREEJS_JSON = 'threejs_json',
// }
// export const LOADER_TYPES = [
// 	LoaderType.AUTO,
// 	LoaderType.JSON_DATA,
// 	// LoaderType.THREEJS_JSON,
// ];

export class CoreLoaderGeometry {
	private ext: string;

	constructor(
		private url: string // private type: LoaderType, // private requester: any
	) {
		const elements = this.url.split('.');
		this.ext = elements[elements.length - 1].toLowerCase();
		if (this.ext === 'zip') {
			this.ext = elements[elements.length - 2];
		}
		// if(!this.type){
		// 	console.error("CoreLoaderGeometry type is not valid", this.type)
		// }
	}

	load(on_success: (objects: Object3D[]) => void, on_error: (error: string) => void) {
		this.load_auto()
			.then((object) => {
				on_success(object);
			})
			.catch((error) => {
				on_error(error);
			});
	}

	private load_auto(): Promise<any> {
		return new Promise(async (resolve, reject) => {
			const url = this.url; //.includes('?') ? this.url : `${this.url}?${Date.now()}`;

			if (this.ext == 'json') {
				axios
					.get(url)
					.then((response) => {
						const obj_loader = new ObjectLoader();
						obj_loader.parse(response.data, (obj) => {
							resolve(this.on_load_success(obj.children[0]));
						});
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				const loader = await this.loader_for_ext();
				if (loader) {
					loader.load(
						url,
						(object: any) => {
							console.log(object);
							this.on_load_success(object).then((object2) => {
								resolve(object2);
							});
						},
						undefined,
						(error_message: ErrorEvent) => {
							reject(error_message);
						}
					);
				} else {
					const error_message = `format not supported (${this.ext})`;
					reject(error_message);
				}
				// CoreLoaderGeometry.loader_for_ext().then((loader) => {
				// 	if (loader) {
				// 		loader.load(
				// 			url,
				// 			(object: Object3D) => {
				// 				this.on_load_success(object).then((object2) => {
				// 					resolve(object2);
				// 				});
				// 			},
				// 			null,
				// 			(error_message: string) => {
				// 				reject(error_message);
				// 			}
				// 		);
				// 	} else {
				// 		const error_message = `format not supported (${this.ext})`;
				// 		console.warn(error_message);
				// 		reject(error_message);
				// 	}
				// });
			}
		});
	}

	private async on_load_success(object: Object3D | BufferGeometry | object): Promise<Object3D[]> {
		// console.log("animation?", object.animations)
		// if(object.animations){
		// 	await CoreScriptLoader.load('/three/js/utils/SkeletonUtils')
		// }
		if (object instanceof Object3D) {
			switch (this.ext) {
				case 'gltf':
					return this.on_load_succes_gltf(object);
				case 'glb':
					return this.on_load_succes_gltf(object);
				// case 'drc':
				// 	return this.on_load_succes_drc(object);
				case 'obj':
					return [object]; // [object] //.children
				case 'json':
					return [object]; // [object] //.children
				default:
					return [object];
			}
		}
		if (object instanceof BufferGeometry) {
			switch (this.ext) {
				case 'drc':
					return this.on_load_succes_drc(object);
				default:
					return [new Mesh(object)];
			}
		}

		// if it's an object, such as returned by glb
		switch (this.ext) {
			case 'gltf':
				return this.on_load_succes_gltf(object);
			case 'glb':
				return this.on_load_succes_gltf(object);
			default:
				return [];
		}
		return [];
	}

	private on_load_succes_gltf(gltf: any): Object3D[] {
		const scene = gltf['scene'];
		scene.animations = gltf.animations;

		console.log('[scene]', [scene]);
		return [scene]; //.children
	}
	private on_load_succes_drc(geometry: BufferGeometry): Object3D[] {
		const mat = new MeshLambertMaterial();
		const mesh = new Mesh(geometry, mat);

		return [mesh]; //.children
	}

	async loader_for_ext() {
		switch (this.ext.toLowerCase()) {
			case 'gltf':
				return this.loader_for_gltf();
			case 'glb':
				return this.loader_for_glb();
			case 'drc':
				return this.loader_for_drc();
			case 'obj':
				return this.loader_for_obj();
		}
	}

	async loader_for_gltf() {
		// 'DDSLoader', 'DRACOLoader', 'GLTFLoader'
		// const {DDSLoader} = await import(`modules/three/examples/jsm/loaders/DDSLoader`);
		// const {DRACOLoader} = await import(`modules/three/examples/jsm/loaders/DRACOLoader`);
		const {GLTFLoader} = await import(`../../../modules/three/examples/jsm/loaders/GLTFLoader`);
		return new GLTFLoader();
	}
	async loader_for_glb() {
		const {GLTFLoader} = await import(`../../../modules/three/examples/jsm/loaders/GLTFLoader`);
		const {DRACOLoader} = await import(`../../../modules/three/examples/jsm/loaders/DRACOLoader`);

		const loader = new GLTFLoader();
		const draco_loader = new DRACOLoader();
		const decoder_path = '/three/js/libs/draco/gltf/';
		// DRACOLoader.setDecoderPath( decoder_path );
		draco_loader.setDecoderPath(decoder_path);
		draco_loader.setDecoderConfig({type: 'js'});
		loader.setDRACOLoader(draco_loader);

		return loader;
	}
	async loader_for_drc() {
		// const {DDSLoader} = await import(`modules/three/examples/jsm/loaders/DDSLoader`);
		const {DRACOLoader} = await import(`../../../modules/three/examples/jsm/loaders/DRACOLoader`);
		// const {GLTFLoader} = await import(`modules/three/examples/jsm/loaders/GLTFLoader`);

		// const loader = new GLTFLoader();
		const draco_loader = new DRACOLoader();
		const decoder_path = '/three/js/libs/draco/';
		// DRACOLoader.setDecoderPath( decoder_path );
		draco_loader.setDecoderPath(decoder_path);
		draco_loader.setDecoderConfig({type: 'js'});
		// loader.setDRACOLoader(draco_loader);
		// console.log('loader', loader);
		return draco_loader;
	}
	async loader_for_obj() {
		const {OBJLoader} = await import(`../../../modules/three/examples/jsm/loaders/OBJLoader`);
		return new OBJLoader();
	}

	// 	const ext_lowercase = this.ext.toLowerCase();
	// 	let script_names = SCRIPT_URLS_BY_EXT[ext_lowercase];
	// 	if (script_names) {
	// 		if (!lodash_isArray(script_names)) {
	// 			script_names = [script_names];
	// 		}
	// 		let imported_modules = {};
	// 		let imported_module;
	// 		for (let script_name of script_names) {
	// 			imported_module = await CoreScriptLoader.load_module_three_loader(script_name);
	// 			imported_modules[script_name] = imported_module;
	// 		}

	// 		const loader_class_name = THREE_LOADER_BY_EXT[ext_lowercase];
	// 		const loader_class = imported_module[loader_class_name];
	// 		if (loader_class) {
	// 			const loader = new loader_class();

	// 			if (DRACO_EXTENSIONS.includes(ext_lowercase)) {
	// 				const DRACOLoader = imported_modules.DRACOLoader.DRACOLoader;
	// 				const draco_loader = new DRACOLoader();
	// 				// const decoder_path = '/three/js/libs/draco/gltf/'
	// 				// DRACOLoader.setDecoderPath( decoder_path );
	// 				// draco_loader.setDecoderPath( decoder_path );
	// 				loader.setDRACOLoader(draco_loader);
	// 			}

	// 			return loader;
	// 		}
	// 	}
	// }
}
