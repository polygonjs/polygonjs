import { PolyScene } from '../../../scene/PolyScene';
export declare class SceneCodeExporter {
    private _scene;
    constructor(_scene: PolyScene);
    process(): string;
    private add_semi_colons;
    var_name(): string;
    static sanitize_string(word: string): string;
}
