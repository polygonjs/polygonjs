import {BufferGeometry, Object3D} from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import type {PDB} from 'three/examples/jsm/loaders/PDBLoader';
import {CoreObjectType, ObjectContent} from '../../geometry/ObjectContent';

export type BaseGeoLoaderOutput = Object3D | BufferGeometry | PDB | GLTF | Array<ObjectContent<CoreObjectType>>;
export type OnSuccess<O extends BaseGeoLoaderOutput> = (o: O) => void;
export type OnProgress = (n: ProgressEvent<EventTarget>) => void;
export type OnError = (event: any) => void;
