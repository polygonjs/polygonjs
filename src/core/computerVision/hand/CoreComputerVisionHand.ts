import {Object3D, Vector4} from 'three';
import {Hands, Options, Results} from '@mediapipe/hands';
import {CoreObject} from '../../geometry/modules/three/CoreObject';
import {CoreComputerVisionHandAttribute} from './Common';
import {ParamConfig} from '../../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../../types/GlobalTypes';
import {CoreType} from '../../Type';
import {DEFAULT_POSITION} from './Data';
import {ComputerVisionValidSource} from '../Common';

interface HandTrackingObjectAttributes {
	selfieMode: boolean;
	maxNumHands: number;
	modelComplexity: boolean;
	minDetectionConfidence: number;
	minTrackingConfidence: number;
}
const DEFAULT: HandTrackingObjectAttributes = {
	selfieMode: false,
	maxNumHands: 1,
	modelComplexity: true,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5,
};

export function CoreComputerVisionHandParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param selfieMode */
		selfieMode = ParamConfig.BOOLEAN(DEFAULT.selfieMode);
		/** @param Maximum number of hands to detect */
		maxNumHands = ParamConfig.INTEGER(DEFAULT.maxNumHands, {
			range: [0, 2],
			rangeLocked: [true, false],
		});
		/** @param Complexity of the hand landmark model: 0 or 1. Landmark accuracy as well as inference latency generally go up with the model complexity */
		modelComplexity = ParamConfig.BOOLEAN(DEFAULT.modelComplexity);
		/** @param Minimum confidence value ([0.0, 1.0]) from the hand detection model for the detection to be considered successful */
		minDetectionConfidence = ParamConfig.FLOAT(DEFAULT.minDetectionConfidence, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param Minimum confidence value ([0.0, 1.0]) from the landmark-tracking model for the hand landmarks to be considered tracked successfully, or otherwise hand detection will be invoked automatically on the next input image. Setting it to a higher value can increase robustness of the solution, at the expense of a higher latency. Ignored if static_image_mode is true, where hand detection simply runs on every image */
		minTrackingConfidence = ParamConfig.FLOAT(DEFAULT.minTrackingConfidence, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
	};
}

function locateFile(file: string) {
	return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}
function attributes(object: Object3D): HandTrackingObjectAttributes {
	const selfieMode = CoreObject.attribValue(object, CoreComputerVisionHandAttribute.SELFIE_MODE);
	const maxNumHands = CoreObject.attribValue(object, CoreComputerVisionHandAttribute.MAX_NUM_HANDS);
	const modelComplexity = CoreObject.attribValue(object, CoreComputerVisionHandAttribute.MODEL_COMPLEXITY);
	const minDetectionConfidence = CoreObject.attribValue(
		object,
		CoreComputerVisionHandAttribute.MIN_DETECTION_CONFIDENCE
	);
	const minTrackingConfidence = CoreObject.attribValue(
		object,
		CoreComputerVisionHandAttribute.MAX_TRACKING_CONFIDENCE
	);

	const data = {
		selfieMode: CoreType.isBoolean(selfieMode) ? selfieMode : DEFAULT.selfieMode,
		maxNumHands: CoreType.isNumber(maxNumHands) ? maxNumHands : DEFAULT.maxNumHands,
		modelComplexity: CoreType.isBoolean(modelComplexity) ? modelComplexity : DEFAULT.modelComplexity,
		minDetectionConfidence: CoreType.isNumber(minDetectionConfidence)
			? minDetectionConfidence
			: DEFAULT.minDetectionConfidence,
		minTrackingConfidence: CoreType.isNumber(minTrackingConfidence)
			? minTrackingConfidence
			: DEFAULT.minTrackingConfidence,
	};
	return data;
}
function trackerOptions(attributes: HandTrackingObjectAttributes): Options {
	return {
		selfieMode: attributes.selfieMode,
		maxNumHands: attributes.maxNumHands,
		modelComplexity: attributes.modelComplexity ? 1 : 0,
		minDetectionConfidence: attributes.minDetectionConfidence,
		minTrackingConfidence: attributes.minTrackingConfidence,
	};
}
function createKey(object: Object3D) {
	return JSON.stringify(attributes(object));
}

interface ConvertedResult {
	multiHandLandmarks: Vector4[];
	multiHandWorldLandmarks: Vector4[];
	score: number;
	side: number;
}
type ConvertedResults = ConvertedResult[];
function createConvertedResult(): ConvertedResult {
	const pointsCount = DEFAULT_POSITION.length / 3;
	const multiHandLandmarks: Vector4[] = new Array(pointsCount);
	const multiHandWorldLandmarks: Vector4[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		multiHandLandmarks[i] = new Vector4();
		multiHandWorldLandmarks[i] = new Vector4();
	}
	return {
		multiHandLandmarks,
		multiHandWorldLandmarks,
		score: 0,
		side: 0,
	};
}
function updateConvertedResult(convertedResult: ConvertedResult, results: Results, index: number) {
	//
	const multiHandLandmarks = results.multiHandLandmarks[index];
	for (let i = 0; i < multiHandLandmarks.length; i++) {
		const landmark = multiHandLandmarks[i];
		convertedResult.multiHandLandmarks[i].set(
			landmark.x,
			1 - landmark.y,
			landmark.z,
			landmark.visibility != null ? landmark.visibility : 0
		);
	}

	//
	const multiHandWorldLandmarks = results.multiHandWorldLandmarks[index];
	for (let i = 0; i < multiHandWorldLandmarks.length; i++) {
		const landmark = multiHandWorldLandmarks[i];
		convertedResult.multiHandWorldLandmarks[i].set(
			landmark.x,
			landmark.y,
			landmark.z,
			landmark.visibility != null ? landmark.visibility : 0
		);
	}

	//
	const handedness = results.multiHandedness[index];
	convertedResult.score = handedness.score;
	convertedResult.side = handedness.label == 'Right' ? 1 : 0;
}

class TrackerContainer {
	private _inProgress: boolean = false;
	public results: ConvertedResults = [];
	constructor(private tracker: Hands) {
		for (let i = 0; i < 3; i++) {
			this.results.push(createConvertedResult());
		}
		tracker.onResults((results: Results) => {
			this._inProgress = false;
			const subResultsCount = results.multiHandLandmarks.length;
			for (let i = 0; i < subResultsCount; i++) {
				updateConvertedResult(this.results[i], results, i);
			}
		});
	}
	track(source: ComputerVisionValidSource) {
		if (this._inProgress) {
			return;
		}
		this._inProgress = true;
		this.tracker.send({image: source});
	}
}

export class CoreComputerVisionHand {
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
	static trackMedia(object: Object3D, source: ComputerVisionValidSource) {
		const tracker = this.trackerForObject(object);
		tracker.track(source);
	}
	static trackerResults(object: Object3D) {
		return this.trackerForObject(object).results;
	}

	private static _createTracker(options: Options) {
		const hands = new Hands({
			locateFile,
		});
		hands.setOptions(options);
		return new TrackerContainer(hands);
	}

	static trackerKey(object: Object3D): string {
		let key = CoreObject.attribValue(object, CoreComputerVisionHandAttribute.KEY);
		if (!key || !CoreType.isString(key)) {
			key = createKey(object);
			CoreObject.addAttribute(object, CoreComputerVisionHandAttribute.KEY, key);
		}
		return key;
	}

	static setAttributes(object: Object3D, options: HandTrackingObjectAttributes) {
		CoreObject.addAttribute(object, CoreComputerVisionHandAttribute.SELFIE_MODE, options.selfieMode);
		CoreObject.addAttribute(object, CoreComputerVisionHandAttribute.MAX_NUM_HANDS, options.maxNumHands);
		CoreObject.addAttribute(object, CoreComputerVisionHandAttribute.MODEL_COMPLEXITY, options.modelComplexity);
		CoreObject.addAttribute(
			object,
			CoreComputerVisionHandAttribute.MIN_DETECTION_CONFIDENCE,
			options.minDetectionConfidence
		);
		CoreObject.addAttribute(
			object,
			CoreComputerVisionHandAttribute.MAX_TRACKING_CONFIDENCE,
			options.minTrackingConfidence
		);
	}
}
