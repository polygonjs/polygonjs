import {ObjectLoader} from 'three/src/loaders/ObjectLoader';
import {Object3D} from 'three/src/core/Object3D';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Poly} from '../../engine/Poly';
import {ModuleName} from '../../engine/poly/registers/modules/Common';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Mesh} from 'three/src/objects/Mesh';
import {Points} from 'three/src/objects/Points';
import {LineBasicMaterial} from 'three/src/materials/LineBasicMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {PolyScene} from '../../engine/scene/PolyScene';
import {DRACOLoader} from '../../modules/three/examples/jsm/loaders/DRACOLoader';
import {GLTFLoader} from '../../modules/three/examples/jsm/loaders/GLTFLoader';
import {CoreUserAgent} from '../UserAgent';
import {CoreBaseLoader} from './_Base';

enum GeometryExtension {
	DRC = 'drc',
	FBX = 'fbx',
	GLTF = 'gltf',
	GLB = 'glb',
	OBJ = 'obj',
	PDB = 'pdb',
	PLY = 'ply',
	STL = 'stl',
}
export const GEOMETRY_EXTENSIONS: GeometryExtension[] = [
	GeometryExtension.DRC,
	GeometryExtension.FBX,
	GeometryExtension.GLTF,
	GeometryExtension.GLB,
	GeometryExtension.OBJ,
	GeometryExtension.PDB,
	GeometryExtension.PLY,
	GeometryExtension.STL,
];
interface PdbObject {
	geometryAtoms: BufferGeometry;
	geometryBonds: BufferGeometry;
}
type MaxConcurrentLoadsCountMethod = () => number;
export class CoreLoaderGeometry extends CoreBaseLoader {
	public readonly ext: string;

	private static _default_mat_mesh = new MeshLambertMaterial();
	private static _default_mat_point = new PointsMaterial();
	private static _default_mat_line = new LineBasicMaterial();

	constructor(url: string, scene: PolyScene) {
		super(url, scene);
		this.ext = CoreLoaderGeometry.get_extension(url);
	}

	static get_extension(url: string) {
		let _url: URL;
		let ext: string | null = null;

		try {
			_url = new URL(url);
			ext = _url.searchParams.get('ext');
		} catch (e) {}
		// the loader checks first an 'ext' in the query params
		// for urls such as http://domain.com/file?path=geometry.obj&t=aaa&ext=obj
		// to know what extension it is, since it may not be before the '?'.
		// But if there is not, the part before the '?' is used
		if (!ext) {
			const url_without_params = url.split('?')[0];
			const elements = url_without_params.split('.');
			ext = elements[elements.length - 1].toLowerCase();
			// if (this.ext === 'zip') {
			// 	this.ext = elements[elements.length - 2];
			// }
		}
		return ext;
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
			const url = await this._urlToLoad();

			if (this.ext == 'json') {
				CoreLoaderGeometry.increment_in_progress_loads_count();
				await CoreLoaderGeometry.wait_for_max_concurrent_loads_queue_freed();
				fetch(url)
					.then(async (response) => {
						const data = await response.json();
						const obj_loader = new ObjectLoader(this.loadingManager);
						obj_loader.parse(data, (obj) => {
							CoreLoaderGeometry.decrement_in_progress_loads_count();
							resolve(this.on_load_success(obj.children[0]));
						});
					})
					.catch((error) => {
						CoreLoaderGeometry.decrement_in_progress_loads_count();
						reject(error);
					});
			} else {
				const loader = this.loader_for_ext();
				if (loader) {
					CoreLoaderGeometry.increment_in_progress_loads_count();
					await CoreLoaderGeometry.wait_for_max_concurrent_loads_queue_freed();
					loader.load(
						url,
						(object: any) => {
							this.on_load_success(object).then((object2) => {
								CoreLoaderGeometry.decrement_in_progress_loads_count();
								resolve(object2);
							});
						},
						undefined,
						(error_message: ErrorEvent) => {
							Poly.warn('error loading', url, error_message);
							CoreLoaderGeometry.decrement_in_progress_loads_count();
							reject(error_message);
						}
					);
				} else {
					const error_message = `format not supported (${this.ext})`;
					reject(error_message);
				}
			}
		});
	}

	private async on_load_success(object: Object3D | BufferGeometry | object): Promise<Object3D[]> {
		// if(object.animations){
		// 	await CoreScriptLoader.load('/three/js/utils/SkeletonUtils')
		// }
		if (object instanceof Object3D) {
			switch (this.ext) {
				case GeometryExtension.GLTF:
					return this.on_load_succes_gltf(object);
				case GeometryExtension.GLB:
					return this.on_load_succes_gltf(object);
				// case 'drc':
				// 	return this.on_load_succes_drc(object);
				case GeometryExtension.OBJ:
					return [object]; // [object] //.children
				case 'json':
					return [object]; // [object] //.children
				default:
					return [object];
			}
		}
		if (object instanceof BufferGeometry) {
			switch (this.ext) {
				case GeometryExtension.DRC:
					return this.on_load_succes_drc(object);
				default:
					return [new Mesh(object)];
			}
		}

		// if it's an object, such as returned by glb or pdb
		switch (this.ext) {
			case GeometryExtension.GLTF:
				return this.on_load_succes_gltf(object);
			case GeometryExtension.GLB:
				return this.on_load_succes_gltf(object);
			case GeometryExtension.PDB:
				return this.on_load_succes_pdb(object as PdbObject);
			default:
				return [];
		}
		return [];
	}

	private on_load_succes_drc(geometry: BufferGeometry): Object3D[] {
		const mesh = new Mesh(geometry, CoreLoaderGeometry._default_mat_mesh);

		return [mesh];
	}
	private on_load_succes_gltf(gltf: any): Object3D[] {
		const scene = gltf['scene'];
		scene.animations = gltf.animations;

		return [scene];
	}
	private on_load_succes_pdb(pdb_object: PdbObject): Object3D[] {
		const atoms = new Points(pdb_object.geometryAtoms, CoreLoaderGeometry._default_mat_point);
		const bonds = new LineSegments(pdb_object.geometryBonds, CoreLoaderGeometry._default_mat_line);

		return [atoms, bonds];
	}

	static module_names(ext: string): ModuleName[] | void {
		switch (ext) {
			case GeometryExtension.DRC:
				return [ModuleName.DRACOLoader];
			case GeometryExtension.FBX:
				return [ModuleName.FBXLoader];
			case GeometryExtension.GLTF:
				return [ModuleName.GLTFLoader];
			case GeometryExtension.GLB:
				return [ModuleName.GLTFLoader, ModuleName.DRACOLoader];
			case GeometryExtension.OBJ:
				return [ModuleName.OBJLoader];
			case GeometryExtension.PDB:
				return [ModuleName.PDBLoader];
			case GeometryExtension.PLY:
				return [ModuleName.PLYLoader];
			case GeometryExtension.STL:
				return [ModuleName.STLLoader];
		}
	}

	loader_for_ext() {
		switch (this.ext.toLowerCase()) {
			case GeometryExtension.DRC:
				return this.loader_for_drc();
			case GeometryExtension.FBX:
				return this.loader_for_fbx();
			case GeometryExtension.GLTF:
				return this.loader_for_gltf();
			case GeometryExtension.GLB:
				return this.loader_for_glb();
			case GeometryExtension.OBJ:
				return this.loader_for_obj();
			case GeometryExtension.PDB:
				return this.loader_for_pdb();
			case GeometryExtension.PLY:
				return this.loader_for_ply();
			case GeometryExtension.STL:
				return this.loader_for_stl();
		}
	}
	loader_for_fbx() {
		const FBXLoader = Poly.modulesRegister.module(ModuleName.FBXLoader);
		if (FBXLoader) {
			return new FBXLoader(this.loadingManager);
		}
	}
	loader_for_gltf() {
		const GLTFLoader = Poly.modulesRegister.module(ModuleName.GLTFLoader);
		if (GLTFLoader) {
			return new GLTFLoader(this.loadingManager);
		}
	}
	loader_for_drc() {
		const DRACOLoader = Poly.modulesRegister.module(ModuleName.DRACOLoader);
		if (DRACOLoader) {
			const draco_loader = new DRACOLoader(this.loadingManager);
			const root = Poly.libs.root();
			const DRACOPath = Poly.libs.DRACOPath();
			if (root || DRACOPath) {
				const decoder_path = `${root || ''}${DRACOPath || ''}/`;

				const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'];
				for (let file of files) {
					const storedUrl = `${DRACOPath}/${file}`;
					const fullUrl = `${decoder_path}${file}`;
					Poly.blobs.fetchBlob({storedUrl, fullUrl});
				}

				draco_loader.setDecoderPath(decoder_path);
			} else {
				(draco_loader as any).setDecoderPath(undefined);
			}

			draco_loader.setDecoderConfig({type: 'js'});
			return draco_loader;
		}
	}

	private static gltf_loader: GLTFLoader | undefined;
	private static draco_loader: DRACOLoader | undefined;
	static loader_for_glb() {
		const GLTFLoader = Poly.modulesRegister.module(ModuleName.GLTFLoader);
		const DRACOLoader = Poly.modulesRegister.module(ModuleName.DRACOLoader);
		if (GLTFLoader && DRACOLoader) {
			this.gltf_loader = this.gltf_loader || new GLTFLoader(this.loadingManager);
			this.draco_loader = this.draco_loader || new DRACOLoader(this.loadingManager);
			const root = Poly.libs.root();
			const DRACOGLTFPath = Poly.libs.DRACOGLTFPath();
			if (root || DRACOGLTFPath) {
				const decoder_path = `${root || ''}${DRACOGLTFPath || ''}/`;

				const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'];
				for (let file of files) {
					const storedUrl = `${DRACOGLTFPath}/${file}`;
					const fullUrl = `${decoder_path}${file}`;
					Poly.blobs.fetchBlob({storedUrl, fullUrl});
				}

				this.draco_loader.setDecoderPath(decoder_path);
			} else {
				(this.draco_loader as any).setDecoderPath(undefined);
			}
			// not having this uses wasm if the relevant libraries are found
			// draco_loader.setDecoderConfig({type: 'js'});
			this.gltf_loader.setDRACOLoader(this.draco_loader);
			return this.gltf_loader;
		}
	}
	loader_for_glb() {
		return CoreLoaderGeometry.loader_for_glb();
	}

	loader_for_obj() {
		const OBJLoader = Poly.modulesRegister.module(ModuleName.OBJLoader);
		if (OBJLoader) {
			return new OBJLoader(this.loadingManager);
		}
	}
	loader_for_pdb() {
		const PDBLoader = Poly.modulesRegister.module(ModuleName.PDBLoader);
		if (PDBLoader) {
			return new PDBLoader(this.loadingManager);
		}
	}
	loader_for_ply() {
		const PLYLoader = Poly.modulesRegister.module(ModuleName.PLYLoader);
		if (PLYLoader) {
			return new PLYLoader(this.loadingManager);
		}
	}
	loader_for_stl() {
		const STLLoader = Poly.modulesRegister.module(ModuleName.STLLoader);
		if (STLLoader) {
			return new STLLoader(this.loadingManager);
		}
	}

	//
	//
	// CONCURRENT LOADS
	//
	//
	private static MAX_CONCURRENT_LOADS_COUNT: number = CoreLoaderGeometry._init_max_concurrent_loads_count();
	private static CONCURRENT_LOADS_DELAY: number = CoreLoaderGeometry._init_concurrent_loads_delay();
	private static in_progress_loads_count: number = 0;
	private static _queue: Array<() => void> = [];
	private static _maxConcurrentLoadsCountMethod: MaxConcurrentLoadsCountMethod | undefined;
	public static setMaxConcurrentLoadsCount(method: MaxConcurrentLoadsCountMethod | undefined) {
		this._maxConcurrentLoadsCountMethod = method;
	}
	private static _init_max_concurrent_loads_count(): number {
		if (this._maxConcurrentLoadsCountMethod) {
			return this._maxConcurrentLoadsCountMethod();
		}
		return CoreUserAgent.isChrome() ? 4 : 1;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // limit to 4 for non chrome,
		// // as firefox was seen hanging trying to load multiple glb files
		// // limit to 1 for safari,
		// if (name) {
		// 	const loads_count_by_browser: PolyDictionary<number> = {
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
		return CoreUserAgent.isChrome() ? 1 : 10;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // add a delay for browsers other than Chrome and Firefox
		// if (name) {
		// 	const delay_by_browser: PolyDictionary<number> = {
		// 		Chrome: 1,
		// 		Firefox: 10,
		// 		Safari: 10,
		// 	};
		// 	const delay = delay_by_browser[name];
		// 	if (delay != null) {
		// 		return delay;
		// 	}
		// }
		// return 10;
	}
	// public static override_max_concurrent_loads_count(count: number) {
	// 	this.MAX_CONCURRENT_LOADS_COUNT = count;
	// }

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
