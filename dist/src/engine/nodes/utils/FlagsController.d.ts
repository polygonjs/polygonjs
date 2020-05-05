import { BaseNodeType } from '../_Base';
import { BypassFlag } from './flags/Bypass';
import { DisplayFlag } from './flags/Display';
export declare class FlagsController {
    protected node: BaseNodeType;
    readonly bypass: DisplayFlag | undefined;
    readonly display: BypassFlag | undefined;
    constructor(node: BaseNodeType);
    has_display(): boolean;
    has_bypass(): boolean;
}
declare const FlagsControllerD_base: {
    new (...args: any[]): {
        node: BaseNodeType;
        display: DisplayFlag;
        has_display(): boolean;
    };
} & typeof FlagsController;
export declare class FlagsControllerD extends FlagsControllerD_base {
}
declare const FlagsControllerB_base: {
    new (...args: any[]): {
        node: BaseNodeType;
        readonly bypass: BypassFlag;
        has_bypass(): boolean;
    };
} & typeof FlagsController;
export declare class FlagsControllerB extends FlagsControllerB_base {
}
declare const FlagsControllerDB_base: {
    new (...args: any[]): {
        node: BaseNodeType;
        readonly bypass: BypassFlag;
        has_bypass(): boolean;
    };
} & {
    new (...args: any[]): {
        node: BaseNodeType;
        display: DisplayFlag;
        has_display(): boolean;
    };
} & typeof FlagsController;
export declare class FlagsControllerDB extends FlagsControllerDB_base {
}
export {};
