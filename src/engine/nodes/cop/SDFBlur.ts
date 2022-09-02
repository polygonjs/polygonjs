/**
 * Blurs a 3D texture, such as the [cop/SDFFromObject](/docs/nodes/cop/SDFFromObject)
 *
 *
 */
import {Texture} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';

class SDFBlurCopParamsConfig extends NodeParamsConfig {}

const ParamsConfig = new SDFBlurCopParamsConfig();

export class SDFBlurCopNode extends TypedCopNode<SDFBlurCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFBlur';
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputContents: Texture[]) {
		const texture = inputContents[0];

		const dataContainer = texture?.source?.data;
		if (!dataContainer) {
			this.states.error.set('the input must be a 3D texture');
			return;
		}
		const width: number = dataContainer.width;
		const height: number = dataContainer.height;
		const depth: number = dataContainer.depth;
		const d: Float32Array = dataContainer.data;

		let i = 0;

		// 1. store in map for easier lookup
		const xMap: Map<number, Map<number, Map<number, number>>> = new Map();
		for (let x = 0; x < width; x++) {
			const yMap = new Map();
			xMap.set(x, yMap);
			for (let y = 0; y < height; y++) {
				const zMap = new Map();
				yMap.set(y, zMap);
				for (let z = 0; z < depth; z++) {
					zMap.set(z, d[i]);

					i++;
				}
			}
		}
		// 1. make the sum of all 27 cells around the current one, and divide by 27
		let yMap_xp1: Map<number, Map<number, number>> = new Map();
		let yMap_xm1: Map<number, Map<number, number>> = new Map();
		let zMap: Map<number, number> = new Map();
		let zMap_yp1: Map<number, number> = new Map();
		let zMap_ym1: Map<number, number> = new Map();
		let zMap_xp1: Map<number, number> = new Map();
		let zMap_xp1_yp1: Map<number, number> = new Map();
		let zMap_xp1_ym1: Map<number, number> = new Map();
		let zMap_xm1: Map<number, number> = new Map();
		let zMap_xm1_yp1: Map<number, number> = new Map();
		let zMap_xm1_ym1: Map<number, number> = new Map();
		i = 0;
		for (let x = 0; x < width; x++) {
			const yMap = xMap.get(x)!;
			if (x > 0 && x < width - 1) {
				yMap_xp1 = xMap.get(x - 1)!;
				yMap_xm1 = xMap.get(x + 1)!;
			}

			for (let y = 0; y < height; y++) {
				if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
					zMap = yMap.get(y)!;
					zMap_yp1 = yMap.get(y - 1)!;
					zMap_ym1 = yMap.get(y + 1)!;
					zMap_xp1 = yMap_xp1.get(y)!;
					zMap_xp1_yp1 = yMap_xp1.get(y - 1)!;
					zMap_xp1_ym1 = yMap_xp1.get(y + 1)!;
					zMap_xm1 = yMap_xm1.get(y)!;
					zMap_xm1_yp1 = yMap_xm1.get(y - 1)!;
					zMap_xm1_ym1 = yMap_xm1.get(y + 1)!;
				}
				for (let z = 0; z < depth; z++) {
					if (x > 0 && x < width - 1 && y > 0 && y < height - 1 && z > 0 && z < depth - 1) {
						const v = zMap.get(z)! + zMap.get(z - 1)! + zMap.get(z + 1)!;
						const v_yp1 = zMap_yp1.get(z)! + zMap_yp1.get(z - 1)! + zMap_yp1.get(z + 1)!;
						const v_ym1 = zMap_ym1.get(z)! + zMap_ym1.get(z - 1)! + zMap_ym1.get(z + 1)!;
						const v_xp1 = zMap_xp1.get(z)! + zMap_xp1.get(z - 1)! + zMap_xp1.get(z + 1)!;
						const v_xp1_yp1 = zMap_xp1_yp1.get(z)! + zMap_xp1_yp1.get(z - 1)! + zMap_xp1_yp1.get(z + 1)!;
						const v_xp1_ym1 = zMap_xp1_ym1.get(z)! + zMap_xp1_ym1.get(z - 1)! + zMap_xp1_ym1.get(z + 1)!;
						const v_xm1 = zMap_xm1.get(z)! + zMap_xm1.get(z - 1)! + zMap_xm1.get(z + 1)!;
						const v_xm1_yp1 = zMap_xm1_yp1.get(z)! + zMap_xm1_yp1.get(z - 1)! + zMap_xm1_yp1.get(z + 1)!;
						const v_xm1_ym1 = zMap_xm1_ym1.get(z)! + zMap_xm1_ym1.get(z - 1)! + zMap_xm1_ym1.get(z + 1)!;
						const total = v + v_yp1 + v_ym1 + v_xp1 + v_xp1_yp1 + v_xp1_ym1 + v_xm1 + v_xm1_yp1 + v_xm1_ym1;

						d[i] = total / 27;
					}
					i++;
				}
			}
		}

		this.setTexture(texture);
	}
}
