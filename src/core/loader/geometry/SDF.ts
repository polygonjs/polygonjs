import {Data3DTexture, RedFormat, LinearFilter, HalfFloatType, FloatType, ClampToEdgeWrapping, Vector3} from 'three';
import {CoreBaseLoader} from '../_Base';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {CoreUserAgent} from '../../UserAgent';

export interface SDFLoaderOptions {}

export class SDFLoader extends CoreBaseLoader<string> {
	constructor(url: string, protected override _node?: BaseNodeType) {
		super(url, _node);
	}

	async load(
		successCallback: (geometry: Data3DTexture) => void,
		progressCallback: (() => void) | undefined,
		errorCallback: (error: ErrorEvent) => void | undefined
	) {
		const url = await this._urlToLoad();

		// const loader = new FileLoader(this.loadingManager);

		try {
			const response = await fetch(url);
			const blob = await response.blob();

			var fileReader = new FileReader();
			fileReader.onload = function (event) {
				try {
					const arrayBuffer = event.target?.result;
					if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
						const texture = loadSDFMetadata(arrayBuffer);
						successCallback(texture);
					} else {
						errorCallback(new ErrorEvent('content is not an arrayBuffer'));
					}
				} catch (err) {
					errorCallback(err instanceof ErrorEvent ? err : new ErrorEvent('fail to read SDF file'));
				}
			};
			fileReader.onerror = () => {
				errorCallback(new ErrorEvent('failure to read response content'));
			};
			fileReader.readAsArrayBuffer(blob);
		} catch (err) {
			errorCallback(err as ErrorEvent);
		}
	}
}

interface MetadataOptions {
	boundMin: Vector3;
	boundMax: Vector3;
	resolution: Vector3;
}
export interface SDFDataContainer {
	width: number;
	height: number;
	depth: number;
	boundMinx: number;
	boundMiny: number;
	boundMinz: number;
	boundMaxx: number;
	boundMaxy: number;
	boundMaxz: number;
	resolutionx: number;
	resolutiony: number;
	resolutionz: number;
	data: Float32Array;
}
export function addSDFMetadataToContainer(texture: Data3DTexture, options: MetadataOptions) {
	const dataContainer = texture?.image as unknown as SDFDataContainer;
	if (!dataContainer) {
		throw new Error('the input must be a 3D texture');
		return;
	}
	dataContainer.boundMinx = options.boundMin.x;
	dataContainer.boundMiny = options.boundMin.y;
	dataContainer.boundMinz = options.boundMin.z;
	dataContainer.boundMaxx = options.boundMax.x;
	dataContainer.boundMaxy = options.boundMax.y;
	dataContainer.boundMaxz = options.boundMax.z;
	dataContainer.resolutionx = options.resolution.x;
	dataContainer.resolutiony = options.resolution.y;
	dataContainer.resolutionz = options.resolution.z;
}
export function readSDFMetadataFromContainer(texture: Data3DTexture) {
	const dataContainer = texture?.image as unknown as SDFDataContainer;
	if (!dataContainer) {
		throw new Error('the input must be a 3D texture');
		return;
	}
	return dataContainer;
}
export function saveSDFMetadata(texture: Data3DTexture) {
	const dataContainer = readSDFMetadataFromContainer(texture);
	if (!dataContainer) {
		throw new Error('the input must be a 3D texture');
		return;
	}
	const data: Float32Array = dataContainer.data;

	const metadataSizes = {
		metadataLength: 1,
		dimensions: 3,
		bounds: 6,
		resolution: 3,
	};
	const metadataLength =
		metadataSizes.metadataLength + metadataSizes.dimensions + metadataSizes.bounds + metadataSizes.resolution;

	// add metadata
	const currentLength = data.length;
	const dataWithMetadata = new Float32Array(currentLength + metadataLength);
	// 1. numbers 0 is length of metadata
	dataWithMetadata[0] = metadataLength;
	// 2. numbers 1 to 3 are the resolution
	dataWithMetadata[1] = dataContainer.width;
	dataWithMetadata[2] = dataContainer.height;
	dataWithMetadata[3] = dataContainer.depth;
	// 3. numbers 4 to 9 are the bounds
	dataWithMetadata[4] = dataContainer.boundMinx;
	dataWithMetadata[5] = dataContainer.boundMiny;
	dataWithMetadata[6] = dataContainer.boundMinz;
	dataWithMetadata[7] = dataContainer.boundMaxx;
	dataWithMetadata[8] = dataContainer.boundMaxy;
	dataWithMetadata[9] = dataContainer.boundMaxz;
	// 4. numbers 10 to 12 are the resolution
	dataWithMetadata[10] = dataContainer.resolutionx;
	dataWithMetadata[11] = dataContainer.resolutiony;
	dataWithMetadata[12] = dataContainer.resolutionz;
	// 5. create new array
	for (let i = 0; i < currentLength; i++) {
		dataWithMetadata[i + metadataLength] = data[i];
	}
	return dataWithMetadata;
}

function loadSDFMetadata(arrayBuffer: ArrayBuffer): Data3DTexture {
	const float32Array = new Float32Array(arrayBuffer);
	const currentLength = float32Array.length;
	// 1. numbers 0 is length of metadata
	const metadataLength = float32Array[0];
	// 2. numbers 1 to 3 are the resolution
	const width = float32Array[1];
	const height = float32Array[2];
	const depth = float32Array[3];
	// 3. numbers 4 to 9 are the bounds
	const boundMinx = float32Array[4];
	const boundMiny = float32Array[5];
	const boundMinz = float32Array[6];
	const boundMaxx = float32Array[7];
	const boundMaxy = float32Array[8];
	const boundMaxz = float32Array[9];
	// 4. numbers 10 to 12 are the resolution
	const resolutionx = float32Array[10];
	const resolutiony = float32Array[11];
	const resolutionz = float32Array[12];

	// 3. create new array
	const texture = createSDFTexture(width, height, depth);
	const dataWithoutMetadata = texture.image.data;
	for (let i = 0; i < currentLength; i++) {
		dataWithoutMetadata[i] = float32Array[i + metadataLength];
	}

	const dataContainer = texture.image as unknown as SDFDataContainer;
	dataContainer.boundMinx = boundMinx;
	dataContainer.boundMiny = boundMiny;
	dataContainer.boundMinz = boundMinz;
	dataContainer.boundMaxx = boundMaxx;
	dataContainer.boundMaxy = boundMaxy;
	dataContainer.boundMaxz = boundMaxz;
	dataContainer.resolutionx = resolutionx;
	dataContainer.resolutiony = resolutiony;
	dataContainer.resolutionz = resolutionz;

	return texture;
}

export function createSDFTexture(width: number, height: number, depth: number) {
	const texture = new Data3DTexture(new Float32Array(width * height * depth).fill(0), width, height, depth);
	texture.format = RedFormat;
	texture.minFilter = LinearFilter;
	texture.magFilter = LinearFilter;
	texture.wrapS = ClampToEdgeWrapping;
	texture.wrapT = ClampToEdgeWrapping;
	(texture as any).wrapR = ClampToEdgeWrapping;
	texture.unpackAlignment = 1;
	texture.needsUpdate = true;
	texture.type = CoreUserAgent.isiOS() ? HalfFloatType : FloatType;
	return texture;
}
