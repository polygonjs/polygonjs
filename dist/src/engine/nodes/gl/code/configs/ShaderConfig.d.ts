import { ShaderName } from '../../../utils/shaders/ShaderName';
export declare class ShaderConfig {
    private _name;
    private _input_names;
    private _dependencies;
    constructor(_name: ShaderName, _input_names: string[], _dependencies: ShaderName[]);
    name(): ShaderName;
    input_names(): string[];
    dependencies(): ShaderName[];
}
