export declare enum NodeContext {
    COP = "cop",
    EVENT = "event",
    GL = "gl",
    JS = "js",
    MANAGER = "managers",
    MAT = "mat",
    OBJ = "objects",
    SOP = "sop",
    POST = "post"
}
export interface NodeContextAndType {
    context: NodeContext;
    type: string;
}
