import { TypedObjNode } from './_Base';
import { Group } from 'three/src/objects/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
export declare class BaseManagerObjNode<K extends NodeParamsConfig> extends TypedObjNode<Group, K> {
    protected _attachable_to_hierarchy: boolean;
    create_object(): Group;
    cook(): void;
}
declare class ParamLessObjParamsConfig extends NodeParamsConfig {
}
export declare class ParamLessBaseManagerObjNode extends BaseManagerObjNode<ParamLessObjParamsConfig> {
}
export {};
