import {BoolArray2D, Array3D} from '../../helpers/DataStructures';

export class Wave {
	readonly data: BoolArray2D;
	readonly compatible: Array3D<Uint8Array | Uint16Array | Uint32Array>;

	readonly sumsOfOnes: Uint8Array | Uint16Array | Uint32Array;
	readonly sumsOfWeights?: Float64Array;
	readonly sumsOfWeightLogWeights?: Float64Array;
	readonly entropies?: Float64Array;

	static readonly opposite = new Uint8Array([2, 3, 0, 1, 5, 4]);

	constructor(length: number, P: number, D: number, shannon: boolean) {
		this.data = new BoolArray2D(P, length);
		this.data.fill();

		if (P < 256) {
			this.compatible = new Array3D(Uint8Array, D, P, length);
			this.sumsOfOnes = new Uint8Array(length);
		} else if (P < 65536) {
			this.compatible = new Array3D(Uint16Array, D, P, length);
			this.sumsOfOnes = new Uint16Array(length);
		} else {
			this.compatible = new Array3D(Uint32Array, D, P, length);
			this.sumsOfOnes = new Uint32Array(length);
		}

		if (shannon) {
			this.sumsOfWeights = new Float64Array(length);
			this.sumsOfWeightLogWeights = new Float64Array(length);
			this.entropies = new Float64Array(length);
		}
	}

	public init(
		propagator: Int32Array[][],
		sumOfWeights: number,
		sumOfWeightLogWeights: number,
		startingEntropy: number,
		shannon: boolean
	) {
		this.data.fill();

		const P = this.data.COLS;
		for (let i = 0; i < this.data.ROWS; i++) {
			for (let p = 0; p < P; p++) {
				for (let d = 0; d < propagator.length; d++) {
					this.compatible.set(d, p, i, propagator[Wave.opposite[d]][p].length);
				}
			}
		}

		this.sumsOfOnes.fill(P);
		if (shannon && this.sumsOfWeights && this.sumsOfWeightLogWeights && this.entropies) {
			this.sumsOfWeights.fill(sumOfWeights);
			this.sumsOfWeightLogWeights.fill(sumOfWeightLogWeights);
			this.entropies.fill(startingEntropy);
		}
	}

	public copyFrom(other: Wave, shannon: boolean) {
		this.data.copy(other.data);
		this.compatible.copy(other.compatible);
		this.sumsOfOnes.set(other.sumsOfOnes);
		if (
			shannon &&
			this.sumsOfWeights &&
			this.sumsOfWeightLogWeights &&
			this.entropies &&
			other.sumsOfWeights &&
			other.sumsOfWeightLogWeights &&
			other.entropies
		) {
			this.sumsOfWeights.set(other.sumsOfWeights);
			this.sumsOfWeightLogWeights.set(other.sumsOfWeightLogWeights);
			this.entropies.set(other.entropies);
		}
	}
}
