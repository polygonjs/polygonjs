import {BufferGeometry, Object3D} from 'three';
import type {GLTF} from '../../../modules/three/examples/jsm/loaders/GLTFLoader';
import type {PDB} from '../../../modules/three/examples/jsm/loaders/PDBLoader';

export type BaseGeoLoaderOutput = Object3D | BufferGeometry | PDB | GLTF;
export type OnSuccess<O extends BaseGeoLoaderOutput> = (o: O) => void;
export type OnProgress = (n: ProgressEvent<EventTarget>) => void;
export type OnError = (event: any) => void;
