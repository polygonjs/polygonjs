import { CoreGroup } from '../../../core/geometry/Group';
import { Material } from 'three/src/materials/Materials';
import { Texture } from 'three/src/textures/Texture';
import { Object3D } from 'three/src/core/Object3D';
import { AnimationClip } from 'three/src/animation/AnimationClip';
import { NodeContext } from '../../poly/NodeContext';
export interface ContainableMap {
    [NodeContext.ANIM]: AnimationClip;
    [NodeContext.EVENT]: string;
    [NodeContext.SOP]: CoreGroup;
    [NodeContext.GL]: string;
    [NodeContext.JS]: string;
    [NodeContext.MANAGER]: boolean;
    [NodeContext.MAT]: Material;
    [NodeContext.COP]: Texture;
    [NodeContext.OBJ]: Object3D;
    [NodeContext.ROP]: any;
    [NodeContext.POST]: number;
}
