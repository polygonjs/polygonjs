import {DirectionalLight, LightProbe, Object3D, Texture, WebGLRenderer} from 'three';
import {XREstimatedLight} from 'three/examples/jsm/webxr/XREstimatedLight';
// import {BaseCopNodeType} from '../../../engine/nodes/cop/_Base';
// import {TypedNode} from '../../../engine/nodes/_Base';
// import {NodeContext} from '../../../engine/poly/NodeContext';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CoreObject} from '../../geometry/modules/three/CoreObject';

const ATTRIB_NAME = {
	IS_ESTIMATED_LIGHT: 'CoreWebXRAREstimatedLight_isEstimatedLight',
	IS_DEFAULT_LIGHTS_PARENT: 'CoreWebXRAREstimatedLight_defaultLightsParent',
	// DEFAULT_ENVIRONMENT_COP_NODE_ID: 'CoreWebXRAREstimatedLight_defaultEnvCopNodeId',
	APPLY_ENV: 'CoreWebXRAREstimatedLight_applyEnv',
	APPLY_LIGHT_PROBE: 'CoreWebXRAREstimatedLight_applyLightProbe',
	APPLY_DIR_LIGHT: 'CoreWebXRAREstimatedLight_applyDirLight',
	// DIR_LIGHT_INTENSITY: 'CoreWebXRAREstimatedLight_dirLightIntensity',
};
export class CoreWebXRAREstimatedLightController {
	static ATTRIB_NAME = ATTRIB_NAME;

	initialize(scene: PolyScene, renderer: WebGLRenderer) {
		this._estimatedLightSourceObject = undefined;
		scene.threejsScene().traverse((object) => {
			if (this._estimatedLightSourceObject) {
				return;
			}
			const isEstimatedLight = CoreObject.attribValue(object, ATTRIB_NAME.IS_ESTIMATED_LIGHT) as boolean | null;
			if (isEstimatedLight == true) {
				this._estimatedLightSourceObject = object;
				this._initEstimatedLight(scene, renderer);
			}
		});
	}
	private _estimatedLightSourceObject: Object3D | undefined;
	private _estimatedLight: XREstimatedLight | undefined;
	// const estimatedLight = new XREstimatedLight(renderer);
	private async _initEstimatedLight(scene: PolyScene, renderer: WebGLRenderer) {
		if (!this._estimatedLightSourceObject) {
			return;
		}

		// default lights
		const estimatedLightSourceObject = this._estimatedLightSourceObject;
		const defaultLightsParent = this._estimatedLightSourceObject.children.find((child) =>
			CoreObject.attribValue(child, ATTRIB_NAME.IS_DEFAULT_LIGHTS_PARENT)
		);

		// default envs
		// const defaultEnvNodeId = CoreObject.attribValue(
		// 	this._estimatedLightSourceObject,
		// 	ATTRIB_NAME.DEFAULT_ENVIRONMENT_COP_NODE_ID
		// ) as number | null;
		// const defaultEnvGraphNode = defaultEnvNodeId ? scene.graph.nodeFromId(defaultEnvNodeId) : undefined;
		// let defaultEnvTexture: Texture | undefined;
		// if (
		// 	defaultEnvGraphNode != null &&
		// 	defaultEnvGraphNode instanceof TypedNode &&
		// 	defaultEnvGraphNode.context() == NodeContext.COP
		// ) {
		// 	const defaultEnvNode = defaultEnvGraphNode as BaseCopNodeType;
		// 	const container = await defaultEnvNode.compute();
		// 	defaultEnvTexture = container.texture();
		// }

		// lights customisation
		const applyEnv =
			(CoreObject.attribValue(estimatedLightSourceObject, ATTRIB_NAME.APPLY_ENV) as boolean | null) || false;
		const applyLightProbe =
			(CoreObject.attribValue(estimatedLightSourceObject, ATTRIB_NAME.APPLY_LIGHT_PROBE) as boolean | null) ||
			false;
		const applyDirLight =
			(CoreObject.attribValue(estimatedLightSourceObject, ATTRIB_NAME.APPLY_DIR_LIGHT) as boolean | null) ||
			false;
		// const dirLightIntensity =
		// 	(CoreObject.attribValue(estimatedLightSourceObject, ATTRIB_NAME.DIR_LIGHT_INTENSITY) as number | null) || 1;

		// estimation init
		if (this._estimatedLight) {
			this._estimatedLightSourceObject.remove(this._estimatedLight);
		}
		// estimation init
		this._estimatedLight = new XREstimatedLight(renderer);
		this._estimatedLightSourceObject.add(this._estimatedLight);
		const threejsScene = scene.threejsScene();

		let previousEnv: Texture | null = null;
		const estimatedLight = this._estimatedLight;
		this._estimatedLight.addEventListener('estimationstart', () => {
			// Swap the default light out for the estimated one one we start getting some estimated values.
			estimatedLightSourceObject.add(estimatedLight);
			if (defaultLightsParent) {
				estimatedLightSourceObject.remove(defaultLightsParent);
			}

			// remove/tweak lights
			estimatedLight.traverse((child) => {
				if (child instanceof LightProbe) {
					if (applyLightProbe == false) {
						child.removeFromParent();
					}
				}
				if (child instanceof DirectionalLight) {
					if (applyDirLight == false) {
						child.removeFromParent();
					}
				}
			});

			// The estimated lighting also provides an environment cubemap, which we can apply here.
			if (applyEnv && estimatedLight.environment) {
				previousEnv = threejsScene.environment;
				threejsScene.environment = estimatedLight.environment;
			}
		});

		estimatedLight.addEventListener('estimationend', () => {
			// Swap the lights back when we stop receiving estimated values.
			if (defaultLightsParent) {
				estimatedLightSourceObject.add(defaultLightsParent);
			}
			estimatedLightSourceObject.remove(estimatedLight);

			// Revert back to the default environment.
			threejsScene.environment = previousEnv;

			// estimatedLight.dispose()
		});
	}

	dispose() {
		if (this._estimatedLight) {
			this._estimatedLightSourceObject?.remove(this._estimatedLight);
			this._estimatedLight = undefined;
		}
	}
}
