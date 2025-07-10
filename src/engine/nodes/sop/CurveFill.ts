/**
 * Fill a 2D curve
 *
 */

import {LineSegments, Mesh, BufferGeometry, BufferAttribute} from 'three';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CurveFromPointsSopOperation} from '../../operations/sop/CurveFromPoints';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import earcut from 'earcut';

const MULT = 64;

class CurveFillSopParamsConfig extends NodeParamsConfig {
	debug = ParamConfig.BOOLEAN(true);
}
const ParamsConfig = new CurveFillSopParamsConfig();

export class CurveFillSopNode extends TypedSopNode<CurveFillSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'curveFill';
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(CurveFromPointsSopOperation.INPUT_CLONED_STATE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.threejsObjects();
		const newObjects: Mesh[] = [];
		for (const inputObject of objects) {
			if ((inputObject as LineSegments).isLineSegments) {
				const inputGeometry = (inputObject as LineSegments).geometry;
				const inputPositions = inputGeometry.getAttribute('position').array;
				const pointsCount = inputPositions.length / 3;
				const outline: number[] = new Array(pointsCount * 2).fill(-1);
				for (let i = 0; i < pointsCount; i++) {
					outline[i * 2] = Math.round(inputPositions[i * 3] * MULT);
					outline[i * 2 + 1] = Math.round(inputPositions[i * 3 + 2] * MULT);
					if (i > 0) {
						if (outline[i * 2] == outline[(i - 1) * 2] && outline[i * 2 + 1] == outline[(i - 1) * 2 + 1]) {
							throw new Error(`duplicate point at index ${i}`);
						}
					}
				}
				console.log(outline);
				console.log({outlinePointsCount: pointsCount});
				const holeIndices: number[] = [];
				const result = earcut(outline, holeIndices);
				console.log(result);
				const trianglesCount = result.length / 3;

				// invert the first 2 indices of each triangle
				for (let i = 0; i < trianglesCount; i++) {
					const index0 = result[i * 3];
					result[i * 3] = result[i * 3 + 1];
					result[i * 3 + 1] = index0;
				}

				console.log({trianglesCount});
				console.log({maxIndex: Math.max(...result)});

				const geometry = new BufferGeometry();
				const mesh = new Mesh(geometry);
				const normals: number[] = new Array(pointsCount * 3).fill(0);
				const normalsTypedArray = new Float32Array(normals);
				const positionAttribute = new BufferAttribute(inputPositions, 3);
				const normalAttribute = new BufferAttribute(normalsTypedArray, 3);
				geometry.setAttribute('position', positionAttribute);
				geometry.setAttribute('normal', normalAttribute);
				geometry.setIndex(result);

				newObjects.push(mesh);
			}
		}

		this.setObjects(newObjects);
	}
}
