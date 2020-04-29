import { SceneJsonImporter } from './Scene';
export declare class ImportReport {
    private _warnings;
    constructor(_scene_importer: SceneJsonImporter);
    get warnings(): string[];
    reset(): void;
    add_warning(message: string): void;
}
