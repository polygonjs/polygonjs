import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
import { TypedMatNode } from '../_Base';
import { Material } from 'three/src/materials/Material';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Scene } from 'three/src/scenes/Scene';
import { Camera } from 'three/src/cameras/Camera';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Geometry } from 'three/src/core/Geometry';
import { Group } from 'three/src/objects/Group';
import { Object3D } from 'three/src/core/Object3D';
export declare function TextureMapParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        color: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.COLOR>;
        step_size: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        density: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        shadow_density: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        light_dir: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
    };
} & TBase;
declare class VolumeMaterial extends ShaderMaterial {
}
declare const TextureMapParamsConfig_base: {
    new (...args: any[]): {
        color: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.COLOR>;
        step_size: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        density: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        shadow_density: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        light_dir: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR3>;
    };
} & typeof NodeParamsConfig;
declare class TextureMapParamsConfig extends TextureMapParamsConfig_base {
}
declare abstract class VolumeMatNode extends TypedMatNode<VolumeMaterial, TextureMapParamsConfig> {
}
export declare class VolumeController {
    private node;
    constructor(node: VolumeMatNode);
    private static _object_bbox;
    static render_hook(renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry | Geometry, material: Material, group: Group | null, object: Object3D): void;
    update_uniforms_from_params(): void;
}
export {};
