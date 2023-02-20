import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {TypeAssert} from '../../poly/Assert';
import {InstancedBufferGeometry} from 'three';
import {Mesh} from 'three';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {DefaultOperationParams} from '../../../core/operations/_Base';

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
				return this._cookForUpdateGeo(inputCoreGroups, params);
			}
			case InstanceUpdateMode.POINTS: {
				return this._cookForUpdatePoints(inputCoreGroups, params);
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _cookForUpdateGeo(inputCoreGroups: CoreGroup[], params: InstanceUpdateSopParams) {
		const instanceCoreGroup = inputCoreGroups[0];
		const instanceObject = instanceCoreGroup.objects()[0] as Mesh;
		const instanceBufferGeo = instanceObject.geometry as InstancedBufferGeometry;
		const updatingMesh = inputCoreGroups[1].objectsWithGeo()[0] as Mesh;
		const attribNames = instanceCoreGroup.geoAttribNamesMatchingMask(params.geoAttributes);
		for (let attribName of attribNames) {
			const instanceAttrib = instanceBufferGeo.getAttribute(attribName);
			const updatingAttribArray = updatingMesh.geometry.getAttribute(attribName).array as number[];
			(instanceAttrib.array as number[]) = updatingAttribArray.slice(0, updatingAttribArray.length - 1);
			instanceAttrib.needsUpdate = true;
		}
	}
	private _cookForUpdatePoints(inputCoreGroups: CoreGroup[], params: InstanceUpdateSopParams) {
		const instanceCoreGroup = inputCoreGroups[0];
		const instanceObject = instanceCoreGroup.objects()[0] as Mesh;
		const instanceBufferGeo = instanceObject.geometry as InstancedBufferGeometry;
		const updatingCoreGroup = inputCoreGroups[1];

		const attribNames = instanceCoreGroup
			.geoAttribNamesMatchingMask(params.pointAttributes)
			.map((attribName) => CoreInstancer.remapName(attribName));

		let updateTransforms = false;
		for (let attribName of attribNames) {
			if (CoreInstancer.transformAttributeNames.includes(attribName)) {
				updateTransforms = true;
			}
		}
		const instancePts = updatingCoreGroup.points();
		if (updateTransforms) {
			CoreInstancer.updateTransformInstanceAttributes(instancePts, updatingCoreGroup, instanceBufferGeo);
			for (let attribName of CoreInstancer.transformAttributeNames) {
				const attrib = instanceBufferGeo.getAttribute(attribName);
				if (attrib) {
					attrib.needsUpdate = true;
				}
			}
		}
	}
}
