/**
 * Update the geometry positions
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Vector3, Mesh, BufferAttribute} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {ActorConnectionPointType} from '../utils/io/connections/Actor';
import {isBooleanTrue} from '../../../core/Type';

export const SetGeometryPositionsInputName = {
	[ActorConnectionPointType.TRIGGER]: ActorConnectionPointType.TRIGGER,
	[ActorConnectionPointType.OBJECT_3D]: ActorConnectionPointType.OBJECT_3D,
	values: 'values',
	lerp: 'lerp',
	attributeNeedsUpdate: 'attributeNeedsUpdate',
	computeNormals: 'computeNormals',
	computeTangents: 'computeTangents',
};
const INPUT_NAMES = [
	SetGeometryPositionsInputName.trigger,
	SetGeometryPositionsInputName.Object3D,
	SetGeometryPositionsInputName.values,
	SetGeometryPositionsInputName.lerp,
	SetGeometryPositionsInputName.attributeNeedsUpdate,
	SetGeometryPositionsInputName.computeNormals,
	SetGeometryPositionsInputName.computeTangents,
];
const DefaultValues: Record<string, number | boolean> = {
	[SetGeometryPositionsInputName.lerp]: 1,
	[SetGeometryPositionsInputName.attributeNeedsUpdate]: true,
	[SetGeometryPositionsInputName.computeNormals]: true,
	[SetGeometryPositionsInputName.computeTangents]: true,
};

class SetGeometryPositionsActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SetGeometryPositionsActorParamsConfig();

const tmpV3 = new Vector3();
const nextV3 = new Vector3();
export class SetGeometryPositionsActorNode extends TypedActorNode<SetGeometryPositionsActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setGeometryPositions';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this.expectedInputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputNames.bind(this));
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
	expectedInputTypes() {
		return [
			ActorConnectionPointType.TRIGGER,
			ActorConnectionPointType.OBJECT_3D,
			ActorConnectionPointType.VECTOR3_ARRAY,
			ActorConnectionPointType.FLOAT,
			ActorConnectionPointType.BOOLEAN,
			ActorConnectionPointType.BOOLEAN,
			ActorConnectionPointType.BOOLEAN,
		];
	}
	protected _expectedInputName(index: number) {
		return INPUT_NAMES[index];
	}
	protected _expectedOutputTypes() {
		return [ActorConnectionPointType.TRIGGER, ActorConnectionPointType.OBJECT_3D];
	}
	protected _expectedOutputNames(i: number) {
		return [ActorConnectionPointType.TRIGGER, ActorConnectionPointType.OBJECT_3D][i];
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const values = this._inputValue<ActorConnectionPointType.VECTOR3_ARRAY>(
			SetGeometryPositionsInputName.values,
			context
		);

		const geometry = (Object3D as Mesh).geometry;
		if (values && geometry) {
			const positionAttribute = geometry.getAttribute(Attribute.POSITION) as BufferAttribute | undefined;
			if (positionAttribute) {
				const lerp =
					this._inputValue<ActorConnectionPointType.FLOAT>(SetGeometryPositionsInputName.lerp, context) || 1;
				const doLerp = lerp < 1;
				const positionArray = positionAttribute.array as number[];
				let i = 0;

				// try {
				for (let value of values) {
					if (doLerp) {
						nextV3.copy(value);
						tmpV3.fromArray(positionArray, i * 3);
						tmpV3.lerp(nextV3, lerp);
					} else {
						tmpV3.copy(value);
					}

					tmpV3.toArray(positionArray, i * 3);
					i++;
				}

				const attributeNeedsUpdate =
					this._inputValue<ActorConnectionPointType.BOOLEAN>(
						SetGeometryPositionsInputName.attributeNeedsUpdate,
						context
					) || false;
				const computeNormals =
					this._inputValue<ActorConnectionPointType.BOOLEAN>(
						SetGeometryPositionsInputName.computeNormals,
						context
					) || false;
				const computeTangents =
					this._inputValue<ActorConnectionPointType.BOOLEAN>(
						SetGeometryPositionsInputName.computeTangents,
						context
					) || false;
				if (isBooleanTrue(attributeNeedsUpdate)) {
					positionAttribute.needsUpdate = true;
				}
				if (isBooleanTrue(computeTangents)) {
					geometry.computeVertexNormals();
				}
				const normalAttribute = geometry.getAttribute(Attribute.NORMAL);
				const uvAttribute = geometry.getAttribute(Attribute.UV);
				const index = geometry.getIndex();
				if (
					positionAttribute != null &&
					uvAttribute != null &&
					normalAttribute != null &&
					index != null &&
					isBooleanTrue(computeNormals)
				) {
					geometry.computeTangents();
				}
			}
		}

		this.runTrigger(context);
	}
}
