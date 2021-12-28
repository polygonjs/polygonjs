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
import {DRACOLoader} from '../../modules/three/examples/jsm/loaders/DRACOLoader';
import {GLTF, GLTFLoader} from '../../modules/three/examples/jsm/loaders/GLTFLoader';
import {CoreUserAgent} from '../UserAgent';
import {CoreBaseLoader} from './_Base';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {TypeAssert} from '../../engine/poly/Assert';
import {PolyScene} from '../../engine/scene/PolyScene';
import {isBooleanTrue} from '../BooleanValue';

export enum GeometryFormat {
	AUTO = 'auto',
	DRC = 'drc',
	FBX = 'fbx',
	JSON = 'json',
	GLTF = 'gltf',
	GLTF_WITH_DRACO = 'gltf_with_draco',
	LDRAW = 'ldraw',
	OBJ = 'obj',
	PDB = 'pdb',
	PLY = 'ply',
	STL = 'stl',
}
export const GEOMETRY_FORMATS: GeometryFormat[] = [
	GeometryFormat.AUTO,
	GeometryFormat.DRC,
	GeometryFormat.FBX,
	GeometryFormat.JSON,
	GeometryFormat.GLTF,
	GeometryFormat.GLTF_WITH_DRACO,
	GeometryFormat.LDRAW,
	GeometryFormat.OBJ,
	GeometryFormat.PDB,
	GeometryFormat.PLY,
	GeometryFormat.STL,
];

enum GeometryExtension {
	DRC = 'drc',
	FBX = 'fbx',
	GLTF = 'gltf',
	GLB = 'glb',
	MPD = 'mpd',
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
	GeometryExtension.MPD,
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
interface CoreLoaderGeometryOptions {
	url: string;
	format: GeometryFormat;
}
export class CoreLoaderGeometry extends CoreBaseLoader {
	private static _default_mat_mesh = new MeshLambertMaterial();
	private static _default_mat_point = new PointsMaterial();
	private static _default_mat_line = new LineBasicMaterial();

	constructor(
		protected _options: CoreLoaderGeometryOptions,
		protected _scene: PolyScene,
		protected _node?: BaseNodeType
	) {
		super(_options.url, _scene, _node);
	}

	load(on_success: (objects: Object3D[]) => void, on_error: (error: string) => void) {
		this._load()
			.then((object) => {
				on_success(object);
			})
			.catch((error) => {
				on_error(error);
			});
	}

	private _load(): Promise<any> {
		return new Promise(async (resolve, reject) => {
			const url = await this._urlToLoad();
			const ext = this.extension();
			if (ext == GeometryFormat.JSON && this._options.format == GeometryFormat.AUTO) {
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
				const loader = await this._loaderForFormat();
				if (loader) {
					CoreLoaderGeometry.increment_in_progress_loads_count();
					await CoreLoaderGeometry.wait_for_max_concurrent_loads_queue_freed();

					loader.load(
						url,
						(object: Object3D | BufferGeometry | PdbObject | GLTF) => {
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
					const error_message = `format not supported (${ext})`;
					reject(error_message);
				}
			}
		});
	}

	private async on_load_success(object: Object3D | BufferGeometry | PdbObject | GLTF): Promise<Object3D[]> {
		const ext = this.extension();

		if (ext == GeometryFormat.JSON) {
			return [object as Object3D];
		}

		// WARNING
		// when exporting with File->Export
		// `object instanceof Object3D` returns false even if it is an Object3D.
		// This needs to be investigated, but in the mean time, we test with .isObject3D
		const obj = object as Object3D;
		if (isBooleanTrue(obj.isObject3D)) {
			switch (ext) {
				case GeometryExtension.PDB:
					return this.on_load_succes_pdb(object as PdbObject);
				case GeometryExtension.OBJ:
					return [obj]; // [object] //.children
				case GeometryExtension.MPD: {
					obj.rotation.x = Math.PI;
					obj.updateMatrix();
					return [obj];
				}
				default:
					return [obj];
			}
		}
		const geo = object as BufferGeometry;
		if (geo.isBufferGeometry) {
			switch (ext) {
				case GeometryExtension.DRC:
					return this.on_load_succes_drc(geo);
				default:
					return [new Mesh(geo)];
			}
		}
		const gltf = object as GLTF;
		if (gltf.scene != null) {
			switch (ext) {
				case GeometryExtension.GLTF:
					return this.on_load_succes_gltf(gltf);
				case GeometryExtension.GLB:
					return this.on_load_succes_gltf(gltf);
				default:
					return [obj];
			}
		}
		const pdbobject = object as PdbObject;
		if (pdbobject.geometryAtoms || pdbobject.geometryBonds) {
			switch (ext) {
				case GeometryExtension.PDB:
					return this.on_load_succes_pdb(pdbobject);
				default:
					return [];
			}
		}

		return [];
	}

	private on_load_succes_drc(geometry: BufferGeometry): Object3D[] {
		const mesh = new Mesh(geometry, CoreLoaderGeometry._default_mat_mesh);

		return [mesh];
	}
	private on_load_succes_gltf(gltf: GLTF): Object3D[] {
		const scene = gltf['scene'];
		scene.animations = gltf.animations;

		return [scene];
	}
	private on_load_succes_pdb(pdb_object: PdbObject): Object3D[] {
		const atoms = new Points(pdb_object.geometryAtoms, CoreLoaderGeometry._default_mat_point);
		const bonds = new LineSegments(pdb_object.geometryBonds, CoreLoaderGeometry._default_mat_line);

		return [atoms, bonds];
	}
	static moduleNamesFromFormat(format: GeometryFormat, ext: string): ModuleName[] | void {
		switch (format) {
			case GeometryFormat.AUTO:
				return this.moduleNamesFromExt(ext);
			case GeometryFormat.DRC:
				return [ModuleName.DRACOLoader];
			case GeometryFormat.FBX:
				return [ModuleName.FBXLoader];
			case GeometryFormat.JSON:
				return [];
			case GeometryFormat.GLTF:
				return [ModuleName.GLTFLoader];
			case GeometryFormat.GLTF_WITH_DRACO:
				return [ModuleName.GLTFLoader, ModuleName.DRACOLoader];
			case GeometryFormat.LDRAW:
				return [ModuleName.LDrawLoader];
			case GeometryFormat.OBJ:
				return [ModuleName.OBJLoader];
			case GeometryFormat.PDB:
				return [ModuleName.PDBLoader];
			case GeometryFormat.PLY:
				return [ModuleName.PLYLoader];
			case GeometryFormat.STL:
				return [ModuleName.STLLoader];
		}
		TypeAssert.unreachable(format);
	}

	static moduleNamesFromExt(ext: string): ModuleName[] | void {
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
	private async _loaderForFormat() {
		const format = this._options.format;
		switch (format) {
			case GeometryFormat.AUTO:
				return this._loaderForExt();
			case GeometryFormat.DRC:
				return this.loader_for_drc(this._node);
			case GeometryFormat.FBX:
				return this.loader_for_fbx();
			case GeometryFormat.JSON:
				return;
			case GeometryFormat.GLTF:
				return this.loader_for_gltf();
			case GeometryFormat.GLTF_WITH_DRACO:
				return this.loader_for_glb(this._node);
			case GeometryFormat.LDRAW:
				return this.loader_for_ldraw();
			case GeometryFormat.OBJ:
				return this.loader_for_obj();
			case GeometryFormat.PDB:
				return this.loader_for_pdb();
			case GeometryFormat.PLY:
				return this.loader_for_ply();
			case GeometryFormat.STL:
				return this.loader_for_stl();
		}
		TypeAssert.unreachable(format);
	}
	private async _loaderForExt() {
		const ext = this.extension();

		switch (ext.toLowerCase()) {
			case GeometryExtension.DRC:
				return this.loader_for_drc(this._node);
			case GeometryExtension.FBX:
				return this.loader_for_fbx();
			case GeometryExtension.GLTF:
				return this.loader_for_gltf();
			case GeometryExtension.GLB:
				return this.loader_for_glb(this._node);
			case GeometryExtension.MPD:
				return this.loader_for_ldraw();
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
	static async loader_for_drc(node?: BaseNodeType) {
		const DRACOLoader = Poly.modulesRegister.module(ModuleName.DRACOLoader);
		if (DRACOLoader) {
			const useJs = true;

			const dracoLoader = new DRACOLoader(this.loadingManager);
			const root = Poly.libs.root();
			const DRACOPath = Poly.libs.DRACOPath();
			if (root || DRACOPath) {
				const decoderPath = `${root || ''}${DRACOPath || ''}/`;

				if (node) {
					// const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'];
					// for (let file of files) {
					// 	const storedUrl = `${DRACOPath}/${file}`;
					// 	const fullUrl = `${decoder_path}${file}`;

					// 	Poly.blobs.fetchBlob({storedUrl, fullUrl, node});
					// }
					const files = useJs ? ['draco_decoder.js'] : ['draco_decoder.wasm', 'draco_wasm_wrapper.js'];
					await this._loadMultipleBlobGlobal({
						files: files.map((file) => {
							return {
								storedUrl: `${decoderPath}/${file}`,
								fullUrl: `${decoderPath}${file}`,
							};
						}),
						node,
						error: 'failed to load draco libraries. Make sure to install them to load .glb files',
					});
				}

				dracoLoader.setDecoderPath(decoderPath);
			} else {
				(dracoLoader as any).setDecoderPath(undefined);
			}

			dracoLoader.setDecoderConfig({type: useJs ? 'js' : 'wasm'});
			return dracoLoader;
		}
	}
	loader_for_drc(node?: BaseNodeType) {
		return CoreLoaderGeometry.loader_for_drc(node);
	}
	static loader_for_ldraw(node?: BaseNodeType) {
		const LDrawLoader = Poly.modulesRegister.module(ModuleName.LDrawLoader);
		if (LDrawLoader) {
			return new LDrawLoader(this.loadingManager);
		}
	}
	loader_for_ldraw(node?: BaseNodeType) {
		return CoreLoaderGeometry.loader_for_ldraw(node);
	}

	private static gltf_loader: GLTFLoader | undefined;
	private static draco_loader: DRACOLoader | undefined;
	static async loader_for_glb(node?: BaseNodeType) {
		const GLTFLoader = Poly.modulesRegister.module(ModuleName.GLTFLoader);
		const DRACOLoader = Poly.modulesRegister.module(ModuleName.DRACOLoader);
		if (GLTFLoader && DRACOLoader) {
			this.gltf_loader = this.gltf_loader || new GLTFLoader(this.loadingManager);
			this.draco_loader = this.draco_loader || new DRACOLoader(this.loadingManager);
			const root = Poly.libs.root();
			const DRACOGLTFPath = Poly.libs.DRACOGLTFPath();
			if (root || DRACOGLTFPath) {
				const decoderPath = `${root || ''}${DRACOGLTFPath || ''}/`;

				if (node) {
					// const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'];
					// for (let file of files) {
					// 	const storedUrl = `${DRACOGLTFPath}/${file}`;
					// 	const fullUrl = `${decoder_path}${file}`;
					// 	Poly.blobs.fetchBlob({storedUrl, fullUrl, node});
					// }
					const files = ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js'];
					await this._loadMultipleBlobGlobal({
						files: files.map((file) => {
							return {
								storedUrl: `${decoderPath}/${file}`,
								fullUrl: `${decoderPath}${file}`,
							};
						}),
						node,
						error: 'failed to load draco libraries. Make sure to install them to load .glb files',
					});
				}

				this.draco_loader.setDecoderPath(decoderPath);
			} else {
				(this.draco_loader as any).setDecoderPath(undefined);
			}
			// not having this uses wasm if the relevant libraries are found
			// draco_loader.setDecoderConfig({type: 'js'});
			this.gltf_loader.setDRACOLoader(this.draco_loader);
			return this.gltf_loader;
		}
	}
	loader_for_glb(node?: BaseNodeType) {
		return CoreLoaderGeometry.loader_for_glb(node);
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

	private static async wait_for_max_concurrent_loads_queue_freed(): Promise<void> {
		if (this.in_progress_loads_count <= this.MAX_CONCURRENT_LOADS_COUNT) {
			return;
		} else {
			return new Promise((resolve) => {
				this._queue.push(resolve);
			});
		}
	}
}
