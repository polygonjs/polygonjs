import { BaseNodeType } from '../_Base';
import { BypassFlag } from './flags/Bypass';
import { DisplayFlag } from './flags/Display';
import { OptimizeFlag } from './flags/Optimize';
export declare class FlagsController {
    protected node: BaseNodeType;
    readonly bypass: DisplayFlag | undefined;
    readonly display: BypassFlag | undefined;
    readonly optimize: OptimizeFlag | undefined;
    constructor(node: BaseNodeType);
    has_display(): boolean;
    has_bypass(): boolean;
    has_optimize(): boolean;
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
declare const FlagsControllerBO_base: {
    new (...args: any[]): {
        node: BaseNodeType;
        readonly optimize: OptimizeFlag;
        has_optimize(): boolean;
    };
} & {
    new (...args: any[]): {
        node: BaseNodeType;
        readonly bypass: BypassFlag;
        has_bypass(): boolean;
    };
} & typeof FlagsController;
export declare class FlagsControllerBO extends FlagsControllerBO_base {
}
declare const FlagsControllerDBO_base: {
    new (...args: any[]): {
        node: BaseNodeType;
        readonly optimize: OptimizeFlag;
        has_optimize(): boolean;
    };
} & {
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
export declare class FlagsControllerDBO extends FlagsControllerDBO_base {
}
export {};
