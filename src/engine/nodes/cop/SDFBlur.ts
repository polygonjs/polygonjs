/**
 * Blurs a 3D texture, such as the [cop/SDFFromObject](/docs/nodes/cop/SDFFromObject)
 *
 *
 */
import {CopType} from './../../poly/registers/nodes/types/Cop';
import {Texture, Data3DTexture, Vector3} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {addSDFMetadataToContainer, readSDFMetadataFromContainer} from '../../../core/loader/geometry/SDF';

type Map3 = Map<number, Map<number, Map<number, number>>>;
type Map2 = Map<number, Map<number, number>>;
type Map1 = Map<number, number>;

class SDFBlurCopParamsConfig extends NodeParamsConfig {
	/** @param resolution */
	resolution = ParamConfig.VECTOR3([-1, -1, -1], {
		cook: false,
		editable: false,
		separatorBefore: true,
	});
	/** @param boundMin */
	boundMin = ParamConfig.VECTOR3([-1, -1, -1], {
		cook: false,
		editable: false,
	});
	/** @param boundMax */
	boundMax = ParamConfig.VECTOR3([1, 1, 1], {
		cook: false,
		editable: false,
	});
}

const ParamsConfig = new SDFBlurCopParamsConfig();

export class SDFBlurCopNode extends TypedCopNode<SDFBlurCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.SDF_BLUR;
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override async cook(inputContents: Texture[]) {
		const texture = inputContents[0];

		const textureData = texture.source?.data;
		if (!textureData) {
			this.states.error.set('the input must be a 3D texture');
			return;
		}
		// const width: number = textureData.width;
		// const height: number = textureData.height;
		// const depth: number = textureData.depth;
		const dataContainer = readSDFMetadataFromContainer(texture as Data3DTexture);
		if (!dataContainer) {
			this.states.error.set('the input must contain a dataContainer');
			return;
		}
		const boundMin = new Vector3(dataContainer.boundMinx, dataContainer.boundMiny, dataContainer.boundMinz);
		const boundMax = new Vector3(dataContainer.boundMaxx, dataContainer.boundMaxy, dataContainer.boundMaxz);
		const resolution = new Vector3(dataContainer.resolutionx, dataContainer.resolutiony, dataContainer.resolutionz);
		const resx = resolution.x;
		const resy = resolution.y;
		const resz = resolution.z;
		const d: Float32Array = textureData.data;

		let i = 0;

		// 1. store in map for easier lookup
		const zMap: Map3 = new Map();
		for (let z = 0; z < resz; z++) {
			const yMap: Map2 = new Map();
			zMap.set(z, yMap);
			for (let y = 0; y < resy; y++) {
				const xMap: Map1 = new Map();
				yMap.set(y, xMap);
				for (let x = 0; x < resx; x++) {
					xMap.set(x, d[i]);

					i++;
				}
			}
		}
		// 1. make the sum of all 27 cells around the current one, and divide by 27
		let yMap: Map2 = new Map();
		let yMap_xp: Map2 = new Map();
		let yMap_xm: Map2 = new Map();
		//
		// let zMap: Map1 = new Map();
		let xMap: Map1 = new Map();
		let xMap_yp: Map1 = new Map();
		let xMap_ym: Map1 = new Map();
		let xMap_zp: Map1 = new Map();
		let xMap_zp_yp: Map1 = new Map();
		let xMap_zp_ym: Map1 = new Map();
		let xMap_zm: Map1 = new Map();
		let xMap_zm_yp: Map1 = new Map();
		let xMap_zm_ym: Map1 = new Map();
		i = 0;
		for (let z = 0; z < resz; z++) {
			const zInRange = z > 0 && z < resz - 1;
			if (zInRange) {
				yMap = zMap.get(z)!;
				yMap_xp = zMap.get(z + 1)!;
				yMap_xm = zMap.get(z - 1)!;
			}

			for (let y = 0; y < resy; y++) {
				const yInRange = zInRange && y > 0 && y < resy - 1;
				if (yInRange) {
					//
					xMap = yMap.get(y)!;
					xMap_yp = yMap.get(y + 1)!;
					xMap_ym = yMap.get(y - 1)!;
					//
					xMap_zp = yMap_xp.get(y)!;
					xMap_zp_yp = yMap_xp.get(y + 1)!;
					xMap_zp_ym = yMap_xp.get(y - 1)!;
					//
					xMap_zm = yMap_xm.get(y)!;
					xMap_zm_yp = yMap_xm.get(y + 1)!;
					xMap_zm_ym = yMap_xm.get(y - 1)!;
				}
				for (let x = 0; x < resx; x++) {
					const xInRange = yInRange && x > 0 && x < resx - 1;
					if (xInRange) {
						//
						const v = xMap.get(x)! + xMap.get(x - 1)! + xMap.get(x + 1)!;
						const v_yp = xMap_yp.get(x)! + xMap_yp.get(x - 1)! + xMap_yp.get(x + 1)!;
						const v_ym = xMap_ym.get(x)! + xMap_ym.get(x - 1)! + xMap_ym.get(x + 1)!;
						//
						const v_xp1 = xMap_zp.get(x)! + xMap_zp.get(x - 1)! + xMap_zp.get(x + 1)!;
						const v_xp_yp = xMap_zp_yp.get(x)! + xMap_zp_yp.get(x - 1)! + xMap_zp_yp.get(x + 1)!;
						const v_xp_ym = xMap_zp_ym.get(x)! + xMap_zp_ym.get(x - 1)! + xMap_zp_ym.get(x + 1)!;
						//
						const v_xm = xMap_zm.get(x)! + xMap_zm.get(x - 1)! + xMap_zm.get(x + 1)!;
						const v_xm_yp = xMap_zm_yp.get(x)! + xMap_zm_yp.get(x - 1)! + xMap_zm_yp.get(x + 1)!;
						const v_xm_ym = xMap_zm_ym.get(x)! + xMap_zm_ym.get(x - 1)! + xMap_zm_ym.get(x + 1)!;
						//
						const total = v + v_yp + v_ym + v_xp1 + v_xp_yp + v_xp_ym + v_xm + v_xm_yp + v_xm_ym;

						d[i] = total / 27;
					}
					i++;
				}
			}
		}

		addSDFMetadataToContainer(texture as Data3DTexture, {
			boundMin,
			boundMax,
			resolution,
		});
		// update params
		this.p.boundMin.set(boundMin);
		this.p.boundMax.set(boundMax);
		this.p.resolution.set(resolution);

		this.setTexture(texture);
	}
}
