import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CubeTexture, LightProbe} from 'three';
import {LightProbeParams, DEFAULT_LIGHT_PROBE_PARAMS} from '../../../core/lights/LightProbe';
import {NodeContext} from '../../poly/NodeContext';
import {LightProbeGenerator} from 'three/examples/jsm/lights/LightProbeGenerator';

export class LightProbeSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: LightProbeParams = DEFAULT_LIGHT_PROBE_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'lightProbe'> {
		return 'lightProbe';
	}
	override async cook(inputCoreGroups: CoreGroup[], params: LightProbeParams) {
		const light = this.createLight();
		light.name = params.name;

		await this.updateLightParams(light, params);
		return this.createCoreGroupFromObjects([light]);
	}

	createLight() {
		const light = new LightProbe();
		light.name = `HemisphereLight_${this._node?.name() || ''}`;
		light.matrixAutoUpdate = false;
		light.updateMatrix();

		return light;
	}
	async updateLightParams(light: LightProbe, params: LightProbeParams) {
		const copNode = params.cubeMap.nodeWithContext(NodeContext.COP, this.states?.error);
		if (copNode) {
			const container = await copNode.compute();
			if (container) {
				const texture = container.texture();
				if (texture instanceof CubeTexture) {
					const lightProbe = LightProbeGenerator.fromCubeTexture(texture);
					light.copy(lightProbe);
					light.sh.scale(params.intensity);
				} else {
					this.states?.error.set(`texture node is not a cube map`);
				}
			} else {
				this.states?.error.set(`texture node invalid`);
			}
		} else {
			this.states?.error.set(`no texture node found`);
		}
	}
}
