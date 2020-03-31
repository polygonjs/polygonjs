import { PolyScene } from './scene/PolyScene';
export declare class Tester {
    static load_scene(): Promise<PolyScene>;
    static create_scene(): PolyScene;
    static test_save_and_load(scene: PolyScene): Promise<void>;
}
