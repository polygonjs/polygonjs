/**
 * Update the object position
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {FaceMesh, Results} from '@mediapipe/face_mesh';
import {Mesh, VideoTexture, Vector3, Vector2} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {isBooleanTrue} from '../../../core/Type';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

// type OnResult = (results: Results, context:ActorNodeTriggerContext)=>void

const _pos = new Vector3();
const _uv = new Vector2();
const _prevPos = new Vector3();

class UpdateMediapipeFaceMeshActorParamsConfig extends NodeParamsConfig {
	/** @param selfie mode */
	selfieMode = ParamConfig.BOOLEAN(0, {
		separatorBefore: true,
	});
	/** @param min detection confidence */
	minDetectionConfidence = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param max detection confidence */
	maxDetectionConfidence = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param prevents jitter between frames */
	smoothFactor = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param scale */
	scale = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
}
const ParamsConfig = new UpdateMediapipeFaceMeshActorParamsConfig();

export class UpdateMediapipeFaceMeshActorNode extends TypedActorNode<UpdateMediapipeFaceMeshActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'updateMediapipeFaceMesh';
	}
	private _faceMesh: FaceMesh | undefined;

	private _inProgress = false;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.TEXTURE,
				ActorConnectionPointType.TEXTURE,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	private updateMeshFromResults(faceMeshObject: Mesh, results: Results) {
		const pv = this.pv;
		const landmark = results.multiFaceLandmarks[0];
		if (!landmark) {
			return;
		}
		const geometry = faceMeshObject.geometry;
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		const uvAttribute = geometry.getAttribute(Attribute.UV);
		const positionArray = positionAttribute.array as number[];
		const uvArray = uvAttribute.array as number[];
		const scale = pv.scale;
		let i = 0;
		const flipY = false;
		const selfie = isBooleanTrue(pv.selfieMode);
		const smoothFactor = pv.smoothFactor;
		const performSmooth = smoothFactor > 0;
		// try {
		for (let pt of landmark) {
			_pos.set(1 - pt.x, 1 - pt.y, pt.z);
			_uv.set(selfie ? _pos.x : 1 - _pos.x, flipY ? _pos.y : 1 - _pos.y);
			_pos.multiplyScalar(scale);

			if (performSmooth) {
				_prevPos.fromArray(positionArray, i * 3);
				_pos.lerp(_prevPos, smoothFactor);
			}

			_pos.toArray(positionArray, i * 3);
			_uv.toArray(uvArray, i * 2);
			i++;
		}
		// } catch (err) {
		// 	console.error(err);
		// 	console.log('landmark', landmark);
		// }
		geometry.computeVertexNormals();
		geometry.computeTangents();
		positionAttribute.needsUpdate = true;
		uvAttribute.needsUpdate = true;
	}

	private _lastMesh: Mesh | undefined;

	private _createFaceMesh() {
		const faceMesh = new FaceMesh({
			locateFile: (file: string) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
			},
		});
		faceMesh.setOptions({
			enableFaceGeometry: true,
			selfieMode: this.pv.selfieMode,
			maxNumFaces: 1,
			minDetectionConfidence: this.pv.minDetectionConfidence,
			minTrackingConfidence: this.pv.maxDetectionConfidence,
		});
		faceMesh.onResults((results: Results) => {
			// this.runTrigger(context);
			this._inProgress = false;
			if (!this._lastMesh) {
				return;
			}
			this.updateMeshFromResults(this._lastMesh, results);
		});

		return faceMesh;
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const texture = this._inputValue<ActorConnectionPointType.TEXTURE>(ActorConnectionPointType.TEXTURE, context);

		if ((Object3D as Mesh).geometry) {
			this._lastMesh = Object3D as Mesh;
		} else {
			return;
		}

		if (texture) {
			if (texture instanceof VideoTexture) {
				const source: HTMLVideoElement = texture.image;
				if (!this._inProgress) {
					this._inProgress = true;
					this._faceMesh = this._faceMesh || this._createFaceMesh();
					this._faceMesh.send({image: source});
				}
			}
		}
	}
}
