import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
import {BufferAttribute, InstancedBufferGeometry} from 'three';
import {Mesh} from 'three';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

const _instancePts: CorePoint<CoreObjectType>[] = [];

export enum InstanceUpdateMode {
	GEO = 'geo',
	POINTS = 'points',
}
export const INSTANCE_UPDATE_MODES: InstanceUpdateMode[] = [InstanceUpdateMode.GEO, InstanceUpdateMode.POINTS];

interface InstanceUpdateSopParams extends DefaultOperationParams {
	mode: number;
	geoAttributes: string;
	pointAttributes: string;
}

export class InstanceUpdateSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: InstanceUpdateSopParams = {
		mode: INSTANCE_UPDATE_MODES.indexOf(InstanceUpdateMode.GEO),
		geoAttributes: 'P N',
		pointAttributes: 'P',
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'instanceUpdate'> {
		return 'instanceUpdate';
	}

	override cook(inputCoreGroups: CoreGroup[], params: InstanceUpdateSopParams) {
		this._cookFromUpdateMode(inputCoreGroups, params);

		return inputCoreGroups[0];
	}

	private _cookFromUpdateMode(inputCoreGroups: CoreGroup[], params: InstanceUpdateSopParams) {
		const mode = INSTANCE_UPDATE_MODES[params.mode];
		switch (mode) {
			case InstanceUpdateMode.GEO: {
				return this._updateGeo(inputCoreGroups, params);
			}
			case InstanceUpdateMode.POINTS: {
				return this._updatePoints(inputCoreGroups, params);
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _updateGeo(inputCoreGroups: CoreGroup[], params: InstanceUpdateSopParams) {
		const instanceCoreGroup = inputCoreGroups[0];
		const updatingCoreGroup = inputCoreGroups[1];
		const instanceObject = instanceCoreGroup.threejsObjects()[0] as Mesh;
		const instanceGeometry = instanceObject.geometry as InstancedBufferGeometry;
		const updatingMesh = updatingCoreGroup.threejsObjectsWithGeo()[0] as Mesh;
		const updatingGeometry = updatingMesh.geometry;
		const attribNames = instanceCoreGroup.pointAttribNamesMatchingMask(params.geoAttributes);
		for (const attribName of attribNames) {
			const updatingAttrib = updatingGeometry.getAttribute(attribName) as BufferAttribute;
			instanceGeometry.setAttribute(attribName, updatingAttrib);
			const instanceAttrib = instanceGeometry.getAttribute(attribName) as BufferAttribute;
			// const updatingAttribArray = updatingAttrib.array as number[];
			// (instanceAttrib.array as number[]) = updatingAttribArray.slice(0, updatingAttribArray.length - 1);
			// instanceAttrib.count = updatingAttrib.count;
			instanceAttrib.needsUpdate = true;
		}
		// index
		if (updatingGeometry.index) {
			instanceGeometry.setIndex(updatingGeometry.index);
			const index = instanceGeometry.getIndex();
			if (index) {
				index.needsUpdate = true;
			}
		} else {
			instanceGeometry.setIndex(null);
		}
		// groups
		instanceGeometry.groups = updatingGeometry.groups;
	}
	private _updatePoints(inputCoreGroups: CoreGroup[], params: InstanceUpdateSopParams) {
		const instanceCoreGroup = inputCoreGroups[0];
		const updatingCoreGroup = inputCoreGroups[1];
		const instanceObject = instanceCoreGroup.threejsObjects()[0] as Mesh;
		const instanceBufferGeo = instanceObject.geometry as InstancedBufferGeometry;

		const attribNames = instanceCoreGroup
			.pointAttribNamesMatchingMask(params.pointAttributes)
			.map((attribName) => CoreInstancer.remapName(attribName));

		let updateTransforms = false;
		for (const attribName of attribNames) {
			if (CoreInstancer.transformAttributeNames.includes(attribName)) {
				updateTransforms = true;
			}
		}
		updatingCoreGroup.points(_instancePts);
		if (updateTransforms) {
			CoreInstancer.updateTransformInstanceAttributes(_instancePts, updatingCoreGroup, instanceBufferGeo);
			for (const attribName of CoreInstancer.transformAttributeNames) {
				const attrib = instanceBufferGeo.getAttribute(attribName);
				if (attrib) {
					attrib.needsUpdate = true;
				}
			}
		}
	}
}
