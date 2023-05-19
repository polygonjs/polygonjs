import type {
	Scene,
	Texture,
	Loader,
	PerspectiveCamera,
	RectAreaLight,
	SpotLight,
	Camera,
	WebGLRenderTarget,
	WebGLRenderer,
	BufferAttribute,
	InterleavedBufferAttribute,
	GLBufferAttribute,
	Material,
	Vector2,
} from 'three';
import type {MeshBVH, MeshBVHUniformStruct} from '../../geometry/bvh/three-mesh-bvh';

export class IESTexture {}
export class IESLoader extends Loader {
	parse(content: string): IESTexture;
}

export class EquirectCamera extends Camera {
	public readonly isEquirectCamera: boolean;
}

export class PhysicalCamera extends PerspectiveCamera {
	public bokehSize: number;
	public fStop: number;
	public apertureBlades: number;
	public apertureRotation: number;
	public focusDistance: number;
	public anamorphicRatio: number;
	constructor(fov?: number, aspect?: number, near?: number, far?: number);
}
export class PhysicalSpotLight extends SpotLight {
	public iesTexture: IESTexture;
	public radius: number;
}

export class ShapedAreaLight extends RectAreaLight {
	public isCircular: boolean;
}
export class PhysicalCameraUniform {
	updateFrom(other: PhysicalCamera): void;
}

interface Updatable {
	updateFrom(
		normal: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute,
		tangent: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute,
		uv: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute,
		color: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute
	): void;
}
export class PathTracingRenderer {
	public samples: number;
	public camera: Camera;
	public target: WebGLRenderTarget;
	public material: PhysicalPathTracingMaterial;
	public stableNoise: boolean;
	public tiles: Vector2;
	constructor(renderer: WebGLRenderer);
	update(): void;
	setSize(x: number, y: number): void;
	reset(): void;
	dispose(): void;
}
interface PathTracingSceneWorkerGenerateOptions {
	onProgress: (p: number) => void;
}
interface GeneratorResult {
	bvh: MeshBVH;
	textures: Texture[];
	materials: Material[];
	lights: PhysicalSpotLight[];
}
export class PathTracingSceneWorker {
	generate(scene: Scene, options: PathTracingSceneWorkerGenerateOptions): Promise<GeneratorResult>;
}
export class BlurredEnvMapGenerator {
	constructor(renderer: WebGLRenderer);
	generate(texture: Texture, amount: number): Texture;
}
type AllowedAttribute = BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute;
export class PhysicalPathTracingMaterial {
	public bounces: number;
	public transmissiveBounces: number;
	public filterGlossyFactor: number;
	public environmentIntensity: number;
	public physicalCamera: PhysicalCameraUniform;
	bvh: MeshBVHUniformStruct;
	attributesArray: {
		updateFrom(
			normal: AllowedAttribute,
			tangent: AllowedAttribute,
			uv: AllowedAttribute,
			color: AllowedAttribute
		): void;
	};
	materialIndexAttribute: {
		updateFrom(index: AllowedAttribute): void;
	};
	envMapInfo: {
		updateFrom(texture: Texture): void;
	};
	textures: {
		setTextures(renderer: WebGLTexture, x: number, y: number, textures: Texture[]): void;
	};
	materials: {
		updateFrom(materials: Material[], textures: Texture[]): void;
	};
	iesProfiles: {
		updateFrom(renderer: WebGLTexture, iesTextures: Array<IESTexture>): void;
	};
	lights: {
		updateFrom(lights: PhysicalSpotLight[], iesTextures: Array<IESTexture>): void;
	};
	setDefine(define: string, value?: number): void;
}
