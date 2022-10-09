import {GodraysPassProps} from './GodRaysPassProps';
import {
	Vector2,
	Vector3,
	Matrix4,
	Texture,
	ShaderMaterial,
	PointLight,
	DirectionalLight,
	TextureLoader,
	RepeatWrapping,
	NearestFilter,
} from 'three';
interface GodRaysDefines {
	IS_POINT_LIGHT?: string;
	IS_DIRECTIONAL_LIGHT?: string;
}

import GodraysFragmentShader from '../gl/godrays.frag.glsl';
import GodraysVertexShader from '../gl/godrays.vert.glsl';

import {BlueNoiseTextureDataURI} from '../gl/bluenoise';
const getBlueNoiseTexture = async (): Promise<Texture> => {
	const textureLoader = new TextureLoader();
	const blueNoiseTexture = await textureLoader.loadAsync(BlueNoiseTextureDataURI);

	blueNoiseTexture.wrapS = RepeatWrapping;
	blueNoiseTexture.wrapT = RepeatWrapping;
	blueNoiseTexture.magFilter = NearestFilter;
	blueNoiseTexture.minFilter = NearestFilter;
	return blueNoiseTexture;
};

export class GodraysMaterial extends ShaderMaterial {
	constructor(props: GodraysPassProps) {
		const uniforms = {
			density: {value: 1 / 128},
			maxDensity: {value: 0.5},
			distanceAttenuation: {value: 2},
			sceneDepth: {value: null},
			lightPos: {value: new Vector3(0, 0, 0)},
			cameraPos: {value: new Vector3(0, 0, 0)},
			resolution: {value: new Vector2(1, 1)},
			lightCameraProjectionMatrix: {value: new Matrix4()},
			lightCameraMatrixWorldInverse: {value: new Matrix4()},
			cameraProjectionMatrixInv: {value: new Matrix4()},
			cameraMatrixWorld: {value: new Matrix4()},
			shadowMap: {value: null},
			mapSize: {value: 1},
			lightCameraNear: {value: 0.1},
			lightCameraFar: {value: 1000},
			blueNoise: {value: null as Texture | null},
			noiseResolution: {value: new Vector2(1, 1)},
			fNormals: {value: []},
			fConstants: {value: []},
		};

		/* const defines = {
      IS_POINT_LIGHT:
        light instanceof THREE.PointLight || (light as any).isPointLight
          ? 1
          : 0,
      IS_DIRECTIONAL_LIGHT:
        light instanceof THREE.DirectionalLight ||
        (light as any).isDirectionalLight
          ? 1
          : 0,
    };*/
		const defines: GodRaysDefines = {};
		if (props.light instanceof PointLight || (props.light as any).isPointLight) {
			defines.IS_POINT_LIGHT = '';
		} else if (props.light instanceof DirectionalLight || (props.light as any).isDirectionalLight) {
			defines.IS_DIRECTIONAL_LIGHT = '';
		}

		super({
			name: 'GodraysMaterial',
			uniforms,
			fragmentShader: GodraysFragmentShader,
			vertexShader: GodraysVertexShader,
			defines,
		});

		getBlueNoiseTexture().then((blueNoiseTexture) => {
			uniforms.blueNoise.value = blueNoiseTexture;
			uniforms.noiseResolution.value.set(blueNoiseTexture.image.width, blueNoiseTexture.image.height);
		});
	}
}
