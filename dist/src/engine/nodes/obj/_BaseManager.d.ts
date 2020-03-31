import { TypedObjNode } from './_Base';
import { Group } from 'three/src/objects/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class BaseManagerObjParamsConfig extends NodeParamsConfig {
}
export declare class BaseManagerObjNode extends TypedObjNode<Group, BaseManagerObjParamsConfig> {
    protected _attachable_to_hierarchy: boolean;
    create_object(): Group;
    cook(): void;
}
export {};
