/**
 * Applies a noise to the geometry
 *
 * @remarks
 * The noise can affect any attribute, not just the position.
 *
 */
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Attribute} from '../../../core/geometry/Attribute';
import {CoreMath} from '../../../core/math/_Module';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
import {BufferAttribute} from 'three';
import {SimplexNoise} from 'three/examples/jsm/math/SimplexNoise';

export enum NoiseOperation {
	ADD = 'add',
	SET = 'set',
	MULT = 'mult',
	SUBTRACT = 'subtract',
	DIVIDE = 'divide',
}
const OPERATIONS: NoiseOperation[] = [
	NoiseOperation.ADD,
	NoiseOperation.SET,
	NoiseOperation.MULT,
	NoiseOperation.SUBTRACT,
	NoiseOperation.DIVIDE,
];

interface FbmParams {
	octaves: number;
	ampAttenuation: number;
	freqIncrease: number;
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CorePoint} from '../../../core/geometry/Point';
import {CoreType} from '../../../core/Type';
import {AttribValue, NumericAttribValue} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {AttribType} from '../../../core/geometry/Constant';
import {SopType} from '../../poly/registers/nodes/types/Sop';
class NoiseSopParamsConfig extends NodeParamsConfig {
	/** @param noise amplitude */
	amplitude = ParamConfig.FLOAT(1);
	/** @param toggle on to multiply the amplitude by a vertex attribute */
	tamplitudeAttrib = ParamConfig.BOOLEAN(0);
	/** @param which vertex attribute to use */
	amplitudeAttrib = ParamConfig.STRING('amp', {visibleIf: {tamplitudeAttrib: true}});
	/** @param noise frequency */
	freq = ParamConfig.VECTOR3([1, 1, 1]);
	/** @param noise offset */
	offset = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param noise octaves */
	octaves = ParamConfig.INTEGER(3, {
		range: [1, 8],
		rangeLocked: [true, false],
	});
	/** @param amplitude attenuation for higher octaves */
	ampAttenuation = ParamConfig.FLOAT(0.5, {range: [0, 1]});
	/** @param frequency increase for higher octaves */
	freqIncrease = ParamConfig.FLOAT(2, {range: [0, 10]});
	/** @param noise seed */
	seed = ParamConfig.INTEGER(0, {
		range: [0, 100],
		separatorAfter: true,
	});
	/** @param toggle on to have the noise be multiplied by the normal */
	useNormals = ParamConfig.BOOLEAN(0);
	/** @param set which attribute will be affected by the noise */
	attribName = ParamConfig.STRING('position');
	/** @param toggle on to use rest attributes. This can be useful when the noise is animated and this node does not clone the input geometry. Without using rest attributes, the noise would be based on an already modified position, and would therefore accumulate on itself after each cook. This may be what you are after, but for a more conventional result, using a rest attribute will ensure that the noise remains stable. Note that the rest attribute can be created by a RestAttributes node */
	useRestAttributes = ParamConfig.BOOLEAN(0);
	/** @param name of rest position */
	restP = ParamConfig.STRING('restP', {visibleIf: {useRestAttributes: true}});
	/** @param name of rest normal */
	restN = ParamConfig.STRING('restN', {visibleIf: {useRestAttributes: true}});
	/** @param operation done when applying the noise (add, set, mult, subtract, divide) */
	operation = ParamConfig.INTEGER(OPERATIONS.indexOf(NoiseOperation.ADD), {
		menu: {
			entries: OPERATIONS.map((operation) => {
				return {
					name: operation,
					value: OPERATIONS.indexOf(operation),
				};
			}),
		},
	});
	/** @param toggle on to recompute normals if the position has been updated */
	computeNormals = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new NoiseSopParamsConfig();

const position = new Vector3();
const normal = new Vector3();

export class NoiseSopNode extends TypedSopNode<NoiseSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.NOISE;
	}

	private _simplexBySeed: Map<number, SimplexNoise> = new Map();
	private _restPos = new Vector3();
	private _restValue2 = new Vector2();
	private _restValue4 = new Vector4();
	private _noiseValueV = new Vector3();
	private _currentAttribValueF = 0;
	private _currentAttribValueV2 = new Vector2();
	private _currentAttribValueV3 = new Vector3();
	private _currentAttribValueV4 = new Vector4();

	static override displayedInputNames(): string[] {
		return ['geometry to add noise to'];
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE]);
	}

	setOperation(operation: NoiseOperation) {
		this.p.operation.set(OPERATIONS.indexOf(operation));
	}

	override cook(input_contents: CoreGroup[]) {
		const coreGroup = input_contents[0];
		const destPoints = coreGroup.points();
		const destAttribName = this.pv.attribName;

		if (!coreGroup.hasAttrib(destAttribName)) {
			this.states.error.set(`attribute ${destAttribName} not found`);
			this.cookController.endCook();
			return;
		}
		const attribType = coreGroup.geoAttribType(destAttribName);
		if (attribType != AttribType.NUMERIC) {
			this.states.error.set(`attribute ${destAttribName} is not a numeric attribute`);
			this.cookController.endCook();
			return;
		}

		// const simplex = this._getSimplex();
		// const useNormals = isBooleanTrue(this.pv.useNormals) && coreGroup.hasAttrib(ATTRIB_NORMAL);
		const targetAttribSize = coreGroup.geoAttribSize(this.pv.attribName);
		// const operation = OPERATIONS[this.pv.operation];
		// const useRestAttributes: boolean = isBooleanTrue(this.pv.useRestAttributes);
		// const baseAmplitude: number = this.pv.amplitude;
		// const useAmplitudeAttrib: boolean = isBooleanTrue(this.pv.tamplitudeAttrib);

		// let currentAttribValue: NumericAttribValue;

		const firstPt = destPoints[0];
		if (!firstPt) {
			this.setCoreGroup(coreGroup);
			return;
		}

		// check the first pt attrib size
		const currentAttribValue: AttribValue = firstPt.attribValue(destAttribName);
		if (CoreType.isString(currentAttribValue)) {
			this.states.error.set('cannot add noise to a string attribute');
			return;
		}
		const fbmParams = {
			octaves: this.pv.octaves,
			ampAttenuation: this.pv.ampAttenuation,
			freqIncrease: this.pv.freqIncrease,
		};

		try {
			switch (targetAttribSize) {
				case 1: {
					this._cookForFloat(destPoints, fbmParams);
					break;
				}
				case 2: {
					this._cookForV2(destPoints, fbmParams);
					break;
				}
				case 3: {
					this._cookForV3(destPoints, fbmParams);
					break;
				}
				case 4: {
					this._cookForV4(destPoints, fbmParams);
					break;
				}
			}
		} catch (err) {
			console.error('sop/noise error', err);
			this.states.error.set(`cook failed for (${this.path()}). make sure the required attributes are present`);
		}
		if (!this.io.inputs.cloneRequired(0)) {
			for (let geometry of coreGroup.geometries()) {
				(geometry.getAttribute(destAttribName) as BufferAttribute).needsUpdate = true;
			}
		}

		if (isBooleanTrue(this.pv.computeNormals)) {
			const objects = coreGroup.threejsObjectsWithGeo();
			for (let object of objects) {
				object.geometry.computeVertexNormals();
			}
		}
		this.setCoreGroup(coreGroup);
	}

	private _cookForFloat(destPoints: CorePoint[], fbmParams: FbmParams) {
		const simplex = this._getSimplex();
		const useRestAttributes = isBooleanTrue(this.pv.useRestAttributes);
		const useNormals = isBooleanTrue(this.pv.useNormals);
		const tamplitudeAttrib = isBooleanTrue(this.pv.tamplitudeAttrib);
		const baseAmplitude: number = this.pv.amplitude;
		const operation = OPERATIONS[this.pv.operation];
		const attribName = this.pv.attribName;
		for (let destPoint of destPoints) {
			if (useRestAttributes) {
				destPoint.attribValueVector3(this.pv.restP, position);
				if (useNormals) {
					destPoint.attribValueVector3(this.pv.restN, normal);
				}
				this._currentAttribValueF = position.x;
			} else {
				destPoint.getPosition(position);
				if (useNormals) {
					destPoint.attribValueVector3(Attribute.NORMAL, normal);
				}
				this._currentAttribValueF = destPoint.attribValueNumber(attribName);
			}

			const amplitude = tamplitudeAttrib ? this._amplitudeFromAttrib(destPoint, baseAmplitude) : baseAmplitude;

			const noiseResult = this._noiseValue(useNormals, simplex, amplitude, fbmParams, position, normal);
			const noiseValue = noiseResult.x; //this._makeNoiseValueCorrectSize(noiseResult, targetAttribSize);

			const newAttribValueF = NoiseSopNode._newAttribValueFromFloat(
				operation,
				this._currentAttribValueF,
				noiseValue
			);
			destPoint.setAttribValueFromNumber(attribName, newAttribValueF);
		}
	}
	private _cookForV2(destPoints: CorePoint[], fbmParams: FbmParams) {
		const simplex = this._getSimplex();
		const useRestAttributes = isBooleanTrue(this.pv.useRestAttributes);
		const useNormals = isBooleanTrue(this.pv.useNormals);
		const tamplitudeAttrib = isBooleanTrue(this.pv.tamplitudeAttrib);
		const baseAmplitude: number = this.pv.amplitude;
		const operation = OPERATIONS[this.pv.operation];
		const attribName = this.pv.attribName;
		for (let destPoint of destPoints) {
			if (useRestAttributes) {
				destPoint.attribValueVector3(this.pv.restP, position);
				if (useNormals) {
					destPoint.attribValueVector3(this.pv.restN, normal);
				}
				this._currentAttribValueV2.set(position.x, position.y);
			} else {
				destPoint.getPosition(position);
				if (useNormals) {
					destPoint.attribValueVector3(Attribute.NORMAL, normal);
				}
				destPoint.attribValueVector2(attribName, this._currentAttribValueV2);
			}

			const amplitude = tamplitudeAttrib ? this._amplitudeFromAttrib(destPoint, baseAmplitude) : baseAmplitude;

			const noiseResult = this._noiseValue(useNormals, simplex, amplitude, fbmParams, position, normal);
			this._restValue2.set(noiseResult.x, noiseResult.y);
			const noiseValue = this._restValue2;

			const newAttribValueV = NoiseSopNode._newAttribValueFromVector2(
				operation,
				this._currentAttribValueV2,
				noiseValue
			);
			destPoint.setAttribValueFromVector2(attribName, newAttribValueV);
		}
	}
	private _cookForV3(destPoints: CorePoint[], fbmParams: FbmParams) {
		const simplex = this._getSimplex();
		const useRestAttributes = isBooleanTrue(this.pv.useRestAttributes);
		const useNormals = isBooleanTrue(this.pv.useNormals);
		const tamplitudeAttrib = isBooleanTrue(this.pv.tamplitudeAttrib);
		const baseAmplitude: number = this.pv.amplitude;
		const operation = OPERATIONS[this.pv.operation];
		const attribName = this.pv.attribName;
		for (let destPoint of destPoints) {
			if (useRestAttributes) {
				destPoint.attribValueVector3(this.pv.restP, position);
				if (useNormals) {
					destPoint.attribValueVector3(this.pv.restN, normal);
				}
				this._currentAttribValueV3.copy(position);
			} else {
				destPoint.getPosition(position);
				if (useNormals) {
					destPoint.attribValueVector3(Attribute.NORMAL, normal);
				}
				destPoint.attribValueVector3(attribName, this._currentAttribValueV3);
			}

			const amplitude = tamplitudeAttrib ? this._amplitudeFromAttrib(destPoint, baseAmplitude) : baseAmplitude;

			const noiseResult = this._noiseValue(useNormals, simplex, amplitude, fbmParams, position, normal);
			const noiseValue = noiseResult; //this._makeNoiseValueCorrectSize(noiseResult, targetAttribSize);

			const newAttribValueV = NoiseSopNode._newAttribValueFromVector3(
				operation,
				this._currentAttribValueV3,
				noiseValue
			);
			destPoint.setAttribValueFromVector3(attribName, newAttribValueV);
		}
	}
	private _cookForV4(destPoints: CorePoint[], fbmParams: FbmParams) {
		const simplex = this._getSimplex();
		const useRestAttributes = isBooleanTrue(this.pv.useRestAttributes);
		const useNormals = isBooleanTrue(this.pv.useNormals);
		const tamplitudeAttrib = isBooleanTrue(this.pv.tamplitudeAttrib);
		const baseAmplitude: number = this.pv.amplitude;
		const operation = OPERATIONS[this.pv.operation];
		const attribName = this.pv.attribName;
		for (let destPoint of destPoints) {
			if (useRestAttributes) {
				destPoint.attribValueVector3(this.pv.restP, position);
				if (useNormals) {
					destPoint.attribValueVector3(this.pv.restN, normal);
				}
				this._currentAttribValueV4.set(position.x, position.y, position.z, 0);
			} else {
				destPoint.getPosition(position);
				if (useNormals) {
					destPoint.attribValueVector3(Attribute.NORMAL, normal);
				}
				destPoint.attribValueVector4(attribName, this._currentAttribValueV4);
			}

			const amplitude = tamplitudeAttrib ? this._amplitudeFromAttrib(destPoint, baseAmplitude) : baseAmplitude;

			const noiseResult = this._noiseValue(useNormals, simplex, amplitude, fbmParams, position, normal);
			this._restValue4.set(noiseResult.x, noiseResult.y, noiseResult.z, 0);
			const noiseValue = this._restValue4; //this._makeNoiseValueCorrectSize(noiseResult, targetAttribSize);

			const newAttribValueV = NoiseSopNode._newAttribValueFromVector4(
				operation,
				this._currentAttribValueV4,
				noiseValue
			);
			destPoint.setAttribValueFromVector4(attribName, newAttribValueV);
		}
	}

	private _noiseValue(
		useNormals: boolean,
		simplex: SimplexNoise,
		amplitude: number,
		fmbParams: FbmParams,
		position: Vector3,
		normal?: Vector3
	) {
		this._restPos.copy(position).add(this.pv.offset).multiply(this.pv.freq);
		// const pos = rest_point.position(this._rest_pos)
		if (useNormals && normal) {
			const noise = amplitude * this._fbm(simplex, fmbParams, this._restPos.x, this._restPos.y, this._restPos.z);
			this._noiseValueV.copy(normal);
			return this._noiseValueV.multiplyScalar(noise);
		} else {
			this._noiseValueV.set(
				amplitude *
					this._fbm(
						simplex,
						fmbParams,
						this._restPos.x + 545,
						this._restPos.y + 125454,
						this._restPos.z + 2142
					),
				amplitude *
					this._fbm(
						simplex,
						fmbParams,
						this._restPos.x - 425,
						this._restPos.y - 25746,
						this._restPos.z + 95242
					),
				amplitude *
					this._fbm(
						simplex,
						fmbParams,
						this._restPos.x + 765132,
						this._restPos.y + 21,
						this._restPos.z - 9245
					)
			);
			return this._noiseValueV;
		}
	}

	private static _newAttribValueFromFloat(
		operation: NoiseOperation,
		current_attrib_value: number,
		noise_value: number
	): number {
		switch (operation) {
			case NoiseOperation.ADD:
				return current_attrib_value + noise_value;
			case NoiseOperation.SET:
				return noise_value;
			case NoiseOperation.MULT:
				return current_attrib_value * noise_value;
			case NoiseOperation.DIVIDE:
				return current_attrib_value / noise_value;
			case NoiseOperation.SUBTRACT:
				return current_attrib_value - noise_value;
		}
		TypeAssert.unreachable(operation);
	}

	private static _newAttribValueFromVector2(
		operation: NoiseOperation,
		current_attrib_value: Vector2,
		noise_value: Vector2
	): Vector2 {
		switch (operation) {
			case NoiseOperation.ADD:
				return current_attrib_value.add(noise_value);
			case NoiseOperation.SET:
				return noise_value;
			case NoiseOperation.MULT:
				return current_attrib_value.multiply(noise_value);
			case NoiseOperation.DIVIDE:
				return current_attrib_value.divide(noise_value);
			case NoiseOperation.SUBTRACT:
				return current_attrib_value.sub(noise_value);
		}
		TypeAssert.unreachable(operation);
	}
	private static _newAttribValueFromVector3(
		operation: NoiseOperation,
		current_attrib_value: Vector3,
		noise_value: Vector3
	): Vector3 {
		switch (operation) {
			case NoiseOperation.ADD:
				return current_attrib_value.add(noise_value);
			case NoiseOperation.SET:
				return noise_value;
			case NoiseOperation.MULT:
				return current_attrib_value.multiply(noise_value);
			case NoiseOperation.DIVIDE:
				return current_attrib_value.divide(noise_value);
			case NoiseOperation.SUBTRACT:
				return current_attrib_value.sub(noise_value);
		}
		TypeAssert.unreachable(operation);
	}
	private static _newAttribValueFromVector4(
		operation: NoiseOperation,
		current_attrib_value: Vector4,
		noise_value: Vector4
	): Vector4 {
		switch (operation) {
			case NoiseOperation.ADD:
				return current_attrib_value.add(noise_value);
			case NoiseOperation.SET:
				return noise_value;
			case NoiseOperation.MULT:
				return current_attrib_value.multiplyScalar(noise_value.x);
			case NoiseOperation.DIVIDE:
				return current_attrib_value.divideScalar(noise_value.x);
			case NoiseOperation.SUBTRACT:
				return current_attrib_value.sub(noise_value);
		}
		TypeAssert.unreachable(operation);
	}

	private _amplitudeFromAttrib(point: CorePoint, base_amplitude: number): number {
		const attrib_value = point.attribValue(this.pv.amplitudeAttrib) as NumericAttribValue;

		if (CoreType.isNumber(attrib_value)) {
			return attrib_value * base_amplitude;
		} else {
			if (attrib_value instanceof Vector2 || attrib_value instanceof Vector3 || attrib_value instanceof Vector4) {
				return attrib_value.x * base_amplitude;
			}
		}
		return 1;
	}

	private _fbm(simplex: SimplexNoise, params: FbmParams, x: number, y: number, z: number): number {
		let value = 0.0;
		let amplitude = 1.0;
		for (let i = 0; i < params.octaves; i++) {
			value += amplitude * simplex.noise3d(x, y, z);
			x *= params.freqIncrease;
			y *= params.freqIncrease;
			z *= params.freqIncrease;
			amplitude *= params.ampAttenuation;
		}
		return value;
	}

	private _getSimplex(): SimplexNoise {
		const simplex = this._simplexBySeed.get(this.pv.seed);
		if (simplex) {
			return simplex;
		} else {
			const simplex = this._createSimplex();
			this._simplexBySeed.set(this.pv.seed, simplex);
			return simplex;
		}
	}
	private _createSimplex(): SimplexNoise {
		const seed = this.pv.seed;
		const random_generator = {
			random: function () {
				return CoreMath.randFloat(seed);
			},
		};
		const simplex = new SimplexNoise(random_generator);
		this._simplexBySeed.delete(seed);
		return simplex;
	}
}
