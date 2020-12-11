import { SceneJsonImporter } from './io/json/import/Scene';
import { PolyScene } from './scene/PolyScene';
import { ExpressionRegister } from './poly/registers/expressions/ExpressionRegister';
import { NodesRegister } from './poly/registers/nodes/NodesRegister';
declare const expressions_register: ExpressionRegister;
declare const nodes_register: NodesRegister;
export { PolyScene, SceneJsonImporter, expressions_register, nodes_register };
declare global {
    interface Window {
        POLY: {
            PolyScene: typeof PolyScene;
            SceneJsonImporter: typeof SceneJsonImporter;
            expressions_register: ExpressionRegister;
            nodes_register: NodesRegister;
        };
    }
}
