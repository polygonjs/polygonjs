import type {BufferGeometry, Object3D} from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import type {PDB} from 'three/examples/jsm/loaders/PDBLoader';
import type {CoreObjectType, ObjectContent} from '../../geometry/ObjectContent';
// import type {IFCModel} from 'web-ifc-three/IFC/components/IFCModel';
type IFCModel = Object3D;

export type BaseGeoLoaderOutput =
	| Object3D
	| BufferGeometry
	| PDB
	| GLTF
	| IFCModel
	| Array<ObjectContent<CoreObjectType>>;
export type OnSuccess<O extends BaseGeoLoaderOutput> = (o: O) => void;
export type OnProgress = (n: ProgressEvent<EventTarget>) => void;
export type OnError = (event: any) => void;
