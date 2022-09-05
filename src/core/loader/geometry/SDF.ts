import {Data3DTexture, RedFormat, LinearFilter, HalfFloatType, FloatType, ClampToEdgeWrapping} from 'three';
import {CoreBaseLoader} from '../_Base';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {CoreUserAgent} from '../../UserAgent';

export interface SDFLoaderOptions {}

export class SDFLoader extends CoreBaseLoader {
	constructor(url: string, options: SDFLoaderOptions = {}, protected override _node?: BaseNodeType) {
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
				console.log(event.target?.result);
				const arrayBuffer = event.target?.result;
				if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
					const texture = loadSDFMetadata(arrayBuffer);
					successCallback(texture);
				} else {
					errorCallback(new ErrorEvent('content is not an arrayBuffer'));
				}
			};
			fileReader.onerror = () => {
				errorCallback(new ErrorEvent('failure to read response content'));
			};
			fileReader.readAsArrayBuffer(blob);
		} catch (err) {
			errorCallback(err as ErrorEvent);
		}

		// loader.setPath(url);
		// loader.setResponseType('arraybuffer');
		// // loader.setRequestHeader( this.requestHeader );
		// // loader.setWithCredentials( this.withCredentials );

		// loader.load(
		// 	url,
		// 	function (data) {
		// 		try {
		// 			console.log(data);
		// 		} catch (e) {
		// 			errorCallback(e as ErrorEvent);
		// 		}
		// 	},
		// 	progressCallback,
		// 	errorCallback
		// );
	}
}

const MEDADATA_LENGTH = 9;
export function saveSDFMetadata(texture: Data3DTexture) {
	console.log(texture);
	const dataContainer = texture?.image;
	if (!dataContainer) {
		throw new Error('the input must be a 3D texture');
		return;
	}
	const width: number = dataContainer.width;
	const height: number = dataContainer.height;
	const depth: number = dataContainer.depth;
	const data: Float32Array = dataContainer.data;

	// add metadata
	const currentLength = data.length;
	const dataWithMetadata = new Float32Array(currentLength + MEDADATA_LENGTH);
	// 1. numbers 0 to 2 are the resolution
	dataWithMetadata[0] = width;
	dataWithMetadata[1] = height;
	dataWithMetadata[2] = depth;
	// 2. numbers 3 to 8 are the bounds
	dataWithMetadata[3] = 0;
	dataWithMetadata[4] = 0;
	dataWithMetadata[5] = 0;
	dataWithMetadata[6] = 1;
	dataWithMetadata[7] = 1;
	dataWithMetadata[8] = 1;
	// 3. create new array
	for (let i = 0; i < currentLength; i++) {
		dataWithMetadata[i + MEDADATA_LENGTH] = data[i];
	}
	return dataWithMetadata;
}

function loadSDFMetadata(arrayBuffer: ArrayBuffer): Data3DTexture {
	const float32Array = new Float32Array(arrayBuffer);
	const currentLength = float32Array.length;
	// 1. numbers 0 to 2 are the resolution
	const width = float32Array[0];
	const height = float32Array[1];
	const depth = float32Array[2];
	// 2. numbers 3 to 8 are the bounds
	// TODO

	// 3. create new array
	const texture = createSDFTexture(width, height, depth);
	const dataWithoutMetadata = texture.image.data;
	for (let i = 0; i < currentLength; i++) {
		dataWithoutMetadata[i] = float32Array[i + MEDADATA_LENGTH];
	}

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
