/**
 * Transfers an attribute from right input to left input
 *
 * @remarks
 * This can be useful to create heatmap.
 *
 */
import {TypedSopNode} from './_Base';
import type {CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreInterpolate} from '../../../core/math/Interpolate';
import {CoreOctree} from '../../../core/math/octree/Octree';
import {CoreIterator} from '../../../core/Iterator';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Box3, Vector3} from 'three';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {pointsFromObjectFromGroup} from '../../../core/geometry/entities/point/CorePointUtils';
const _tmpBox = new Box3();
const _position = new Vector3();
const _nearestPoints: CorePoint[] = [];
class AttribTransferSopParamsConfig extends NodeParamsConfig {
	/** @param source group to transfer from (right input, or input 1) */
	srcGroup = ParamConfig.STRING();
	/** @param dest group to transfer to (left input, or input 0) */
	destGroup = ParamConfig.STRING();
	/** @param name of the attribute to transfer */
	name = ParamConfig.STRING();
	/** @param max number of samples to use */
	maxSamplesCount = ParamConfig.INTEGER(1, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param max distance to search points to transfer from */
	distanceThreshold = ParamConfig.FLOAT(1);
	/** @param blend width */
	blendWidth = ParamConfig.FLOAT(0);
}
const ParamsConfig = new AttribTransferSopParamsConfig();

export class AttribTransferSopNode extends TypedSopNode<AttribTransferSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.ATTRIB_TRANSFER;
	}

	override initializeNode() {
		this.io.inputs.setCount(2);
		this.io.inputs.initInputsClonedState([InputCloneMode.FROM_NODE, InputCloneMode.NEVER]);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		const coreGroupDest = inputCoreGroups[0];
		const coreGroupSrc = inputCoreGroups[1];

		// build octree
		const pointsSrc = coreGroupSrc.pointsFromGroup(this.pv.srcGroup);
		coreGroupSrc.boundingBox(_tmpBox);
		const octree = new CoreOctree(_tmpBox);
		octree.setPoints(pointsSrc);

		// transfer
		const destObjects = coreGroupDest.allObjects();
		const srcObjects = coreGroupSrc.allObjects();
		let i = 0;
		for (const destObject of destObjects) {
			const srcObject = srcObjects[i];
			const corePointClass = corePointClassFactory(destObject);
			const attributeNames = corePointClass.attributeNamesMatchingMask(srcObject, this.pv.name);
			this._addAttributeIfRequired(destObject, srcObject, attributeNames);
			await this._transferAttributes(destObject, octree, attributeNames);
			i++;
		}
		this.setCoreGroup(coreGroupDest);
	}

	private async _transferAttributes<T extends CoreObjectType>(
		object: ObjectContent<T>,
		octree: CoreOctree,
		attribNames: string[]
	) {
		const callback = (destPoint: CorePoint) => {
			this._transferAttributesForPoint(destPoint, octree, attribNames);
		};
		const destPoints = pointsFromObjectFromGroup(object, this.pv.destGroup);
		const _iterator = new CoreIterator();

		await _iterator.startWithArray(destPoints, callback);
	}

	private _addAttributeIfRequired<T extends CoreObjectType>(
		destObject: ObjectContent<T>,
		srcObject: ObjectContent<T>,
		attribNames: string[]
	) {
		for (const attribName of attribNames) {
			const corePointClass = corePointClassFactory(destObject);
			const hasAttrib = corePointClass.hasAttribute(destObject, attribName);
			if (!hasAttrib) {
				const attribSize = corePointClass.attribSize(srcObject, attribName);
				corePointClass.addNumericAttribute(destObject, attribName, attribSize, 0);
			}
		}
	}

	private _transferAttributesForPoint(destPoint: CorePoint, octree: CoreOctree, attribNames: string[]) {
		const totalDist = this.pv.distanceThreshold + this.pv.blendWidth;
		destPoint.position(_position);
		octree.findPoints(_position, totalDist, this.pv.maxSamplesCount, _nearestPoints);

		for (const attribName of attribNames) {
			this._interpolatePoints(destPoint, _nearestPoints, attribName);
		}
	}

	private _interpolatePoints(pointDest: CorePoint, srcPoints: CorePoint[], attribName: string) {
		const newValue = CoreInterpolate.perform(
			pointDest,
			srcPoints,
			attribName,
			this.pv.distanceThreshold,
			this.pv.blendWidth
		);

		if (newValue != null) {
			pointDest.setAttribValue(attribName, newValue);
		}
	}
}
