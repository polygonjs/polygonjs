import {Object3D, Vector4} from 'three';
import {FaceMesh, Options, Results} from '@mediapipe/face_mesh';
import {CoreObject} from '../../geometry/modules/three/CoreObject';
import {CoreComputerVisionFaceAttribute} from './Common';
import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../../types/GlobalTypes';
import {CoreType} from '../../Type';
import {DEFAULT_POSITION} from './Data';

interface FaceTrackingObjectAttributes {
	selfieMode: boolean;
	maxNumFaces: number;
	refineLandmarks: boolean;
	minDetectionConfidence: number;
	minTrackingConfidence: number;
}
const DEFAULT: FaceTrackingObjectAttributes = {
	selfieMode: false,
	maxNumFaces: 1,
	refineLandmarks: false,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5,
};

export function CoreComputerVisionFaceParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param selfieMode */
		selfieMode = ParamConfig.BOOLEAN(DEFAULT.selfieMode);
		/** @param Maximum number of faces to detect */
		maxNumFaces = ParamConfig.INTEGER(DEFAULT.maxNumFaces, {
			range: [0, 2],
			rangeLocked: [true, false],
		});
		/** @param Whether to further refine the landmark coordinates around the eyes and lips, and output additional landmarks around the irises by applying the Attention Mesh Model */
		refineLandmarks = ParamConfig.BOOLEAN(DEFAULT.refineLandmarks);
		/** @param Minimum confidence value ([0.0, 1.0]) from the face detection model for the detection to be considered successful. Default to 0.5. */
		minDetectionConfidence = ParamConfig.FLOAT(DEFAULT.minDetectionConfidence, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param Minimum confidence value ([0.0, 1.0]) from the landmark-tracking model for the face landmarks to be considered tracked successfully, or otherwise face detection will be invoked automatically on the next input image. Setting it to a higher value can increase robustness of the solution, at the expense of a higher latency. Ignored if static_image_mode is true, where face detection simply runs on every image. Default to 0.5. */
		minTrackingConfidence = ParamConfig.FLOAT(DEFAULT.minTrackingConfidence, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
	};
}

type AllowedSource = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;

function locateFile(file: string) {
	return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}
function attributes(object: Object3D): FaceTrackingObjectAttributes {
	const selfieMode = CoreObject.attribValue(object, CoreComputerVisionFaceAttribute.SELFIE_MODE);
	const maxNumFaces = CoreObject.attribValue(object, CoreComputerVisionFaceAttribute.MAX_NUM_FACES);
	const refineLandmarks = CoreObject.attribValue(object, CoreComputerVisionFaceAttribute.REFINE_LANDMARKS);
	const minDetectionConfidence = CoreObject.attribValue(
		object,
		CoreComputerVisionFaceAttribute.MIN_DETECTION_CONFIDENCE
	);
	const minTrackingConfidence = CoreObject.attribValue(
		object,
		CoreComputerVisionFaceAttribute.MAX_TRACKING_CONFIDENCE
	);

	const data = {
		selfieMode: CoreType.isBoolean(selfieMode) ? selfieMode : DEFAULT.selfieMode,
		maxNumFaces: CoreType.isNumber(maxNumFaces) ? maxNumFaces : DEFAULT.maxNumFaces,
		refineLandmarks: CoreType.isBoolean(refineLandmarks) ? refineLandmarks : DEFAULT.refineLandmarks,
		minDetectionConfidence: CoreType.isNumber(minDetectionConfidence)
			? minDetectionConfidence
			: DEFAULT.minDetectionConfidence,
		minTrackingConfidence: CoreType.isNumber(minTrackingConfidence)
			? minTrackingConfidence
			: DEFAULT.minTrackingConfidence,
	};
	return data;
}
function trackerOptions(attributes: FaceTrackingObjectAttributes): Options {
	return {
		selfieMode: attributes.selfieMode,
		maxNumFaces: attributes.maxNumFaces,
		refineLandmarks: attributes.refineLandmarks,
		minDetectionConfidence: attributes.minDetectionConfidence,
		minTrackingConfidence: attributes.minTrackingConfidence,
	};
}
function createKey(object: Object3D) {
	return JSON.stringify(attributes(object));
}

interface ConvertedResult {
	multiFaceLandmarks: Vector4[];
}
type ConvertedResults = ConvertedResult[];
function createConvertedResult(): ConvertedResult {
	const pointsCount = DEFAULT_POSITION.length / 3;
	const multiFaceLandmarks: Vector4[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		multiFaceLandmarks[i] = new Vector4();
	}
	return {
		multiFaceLandmarks,
	};
}
function updateConvertedResult(convertedResult: ConvertedResult, results: Results, index: number) {
	results.multiFaceLandmarks;

	//
	const multiFaceLandmarks = results.multiFaceLandmarks[index];
	for (let i = 0; i < multiFaceLandmarks.length; i++) {
		const landmark = multiFaceLandmarks[i];
		convertedResult.multiFaceLandmarks[i].set(
			1 - landmark.x,
			1 - landmark.y,
			landmark.z,
			landmark.visibility != null ? landmark.visibility : 0
		);
	}
}

class TrackerContainer {
	private _inProgress: boolean = false;
	public results: ConvertedResults = [];
	constructor(private tracker: FaceMesh) {
		for (let i = 0; i < 3; i++) {
			this.results.push(createConvertedResult());
		}
		tracker.onResults((results: Results) => {
			this._inProgress = false;
			const subResultsCount = results.multiFaceLandmarks.length;
			for (let i = 0; i < subResultsCount; i++) {
				updateConvertedResult(this.results[i], results, i);
			}
		});
	}
	track(source: AllowedSource) {
		if (this._inProgress) {
			return;
		}
		this._inProgress = true;
		this.tracker.send({image: source});
	}
}

export class CoreComputerVisionFace {
	private static trackerByKey: Map<string, TrackerContainer> = new Map();
	private static trackerForObject(object: Object3D): TrackerContainer {
		const key = this.trackerKey(object);
		let tracker = this.trackerByKey.get(key);
		if (!tracker) {
			tracker = this._createTracker(trackerOptions(attributes(object)));
			this.trackerByKey.set(key, tracker);
		}
		return tracker;
	}
	static trackMedia(object: Object3D, source: AllowedSource) {
		const tracker = this.trackerForObject(object);
		tracker.track(source);
	}
	static trackerResults(object: Object3D) {
		return this.trackerForObject(object).results;
	}

	private static _createTracker(options: Options) {
		const faceMesh = new FaceMesh({
			locateFile,
		});
		faceMesh.setOptions(options);
		return new TrackerContainer(faceMesh);
	}

	static trackerKey(object: Object3D): string {
		let key = CoreObject.attribValue(object, CoreComputerVisionFaceAttribute.KEY);
		if (!key || !CoreType.isString(key)) {
			key = createKey(object);
			CoreObject.addAttribute(object, CoreComputerVisionFaceAttribute.KEY, key);
		}
		return key;
	}

	static setAttributes(object: Object3D, options: FaceTrackingObjectAttributes) {
		CoreObject.addAttribute(object, CoreComputerVisionFaceAttribute.SELFIE_MODE, options.selfieMode);
		CoreObject.addAttribute(object, CoreComputerVisionFaceAttribute.MAX_NUM_FACES, options.maxNumFaces);
		CoreObject.addAttribute(object, CoreComputerVisionFaceAttribute.REFINE_LANDMARKS, options.refineLandmarks);
		CoreObject.addAttribute(
			object,
			CoreComputerVisionFaceAttribute.MIN_DETECTION_CONFIDENCE,
			options.minDetectionConfidence
		);
		CoreObject.addAttribute(
			object,
			CoreComputerVisionFaceAttribute.MAX_TRACKING_CONFIDENCE,
			options.minTrackingConfidence
		);
	}
}
