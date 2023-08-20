import { Grid } from "../grid";
import { SymmetryHelper } from "../helpers/symmetry";
import { Branch, SequenceNode, RunState } from ".";
import { Rule } from "../rule";
import { Helper } from "../helpers/helper";
import { Optimization } from "../wasm/optimization";

const readScale = (s: string): [number, number] => {
    if (!s.includes("/")) return [parseInt(s), 1];
    const nd = s.split("/");
    return [parseInt(nd[0]), parseInt(nd[1])];
};

export class MapNode extends Branch {
    public readonly rules: Rule[] = [];

    private newgrid: Grid;
    private ND = new Int32Array(6);

    public override async load(
        elem: Element,
        parentSymmetry: Uint8Array,
        grid: Grid
    ) {
        const scalestring = elem.getAttribute("scale");
        if (!scalestring) {
            console.error(elem, "scale should be specified in map node");
            return false;
        }
        const scales = scalestring.split(" ");
        if (scales.length !== 3) {
            console.error(
                elem,
                `scale attribute ${scalestring} should have 3 components separated by space`
            );
            return false;
        }

        const [NX, DX] = readScale(scales[0]);
        const [NY, DY] = readScale(scales[1]);
        const [NZ, DZ] = readScale(scales[2]);

        this.ND.set([NX, NY, NZ, DX, DY, DZ]);

        const newgrid = (this.newgrid = Grid.build(
            elem,
            ~~((NX * grid.MX) / DX),
            ~~((NY * grid.MY) / DY),
            ~~((NZ * grid.MZ) / DZ)
        ));
        if (!newgrid) return false;

        if (!(await super.load(elem, parentSymmetry, newgrid))) return false;
        const symmetry = SymmetryHelper.getSymmetry(
            grid.MZ === 1,
            elem.getAttribute("symmetry"),
            parentSymmetry
        );

        const tasks: Promise<Rule[]>[] = [];

        for (const e of Helper.childrenByTag(elem, "rule")) {
            tasks.push(
                (async () => {
                    const rule = await Rule.load(e, grid, newgrid);
                    rule.original = true;
                    if (!rule) return null;

                    const rules: Rule[] = [];
                    for (const r of rule.symmetries(symmetry, grid.MZ === 1)) {
                        rules.push(r);
                        MapNode.compile(
                            r,
                            grid.MX,
                            grid.MY,
                            grid.MZ,
                            newgrid.MX,
                            newgrid.MY,
                            newgrid.MZ
                        );
                    }
                    return rules;
                })()
            );
        }

        const ruleLists = await Promise.all(tasks);
        if (ruleLists.some((list) => !list)) return false;
        this.rules.splice(0, this.rules.length, ...ruleLists.flat());

        return true;
    }

    public override run() {
        if (this.n >= 0) return SequenceNode.prototype.run.apply(this);

        const { grid, newgrid } = this;
        const [NX, NY, NZ, DX, DY, DZ] = this.ND;
        const { MZ, MY, MX, state } = grid;
        const { state: newstate } = newgrid;

        newgrid.clear();
        for (const rule of this.rules) {
            for (let z = 0; z < MZ; z++)
                for (let y = 0; y < MY; y++)
                    for (let x = 0; x < MX; x++)
                        if (rule.jit_map_match_kernel(state, x, y, z))
                            rule.jit_map_apply_kernel(
                                newstate,
                                ~~((x * NX) / DX),
                                ~~((y * NY) / DY),
                                ~~((z * NZ) / DZ)
                            );
        }

        this.ip.grid = newgrid;
        this.n++;

        return RunState.SUCCESS;
    }

    public override reset() {
        super.reset();
        this.n = -1;
    }

    private static compile(
        rule: Rule,
        MX: number,
        MY: number,
        MZ: number,
        NX: number,
        NY: number,
        NZ: number
    ) {
        const { input, output, IO_DIM } = rule;

        const [IMX, IMY, IMZ, OMX, OMY, OMZ] = IO_DIM;

        // jit_map_match_kernel
        if (rule.input.length < Optimization.inline_limit) {
            const code: string[] = [];

            for (let dz = 0; dz < IMZ; dz++) {
                for (let dy = 0; dy < IMY; dy++) {
                    for (let dx = 0; dx < IMX; dx++) {
                        const inputWave = input[dx + dy * IMX + dz * IMX * IMY];
                        code.push(`
        {
            const sx = (x + ${dx}) % ${MX};
            const sy = (y + ${dy}) % ${MY};
            const sz = (z + ${dz}) % ${MZ};

            if (
                (${inputWave} &
                    (1 << state[sx + sy * ${MX} + sz * ${MX * MY}])) ===
                0
            )
                return false;
        }`);
                    }
                }
            }

            code.push("return true;");
            rule.jit_map_match_kernel = <typeof rule.jit_map_match_kernel>(
                new Function(
                    "state",
                    "x",
                    "y",
                    "z",
                    code.map((line) => " ".repeat(4) + line).join("\n")
                )
            );
        } else {
            rule.jit_map_match_kernel = (
                state: Uint8Array,
                x: number,
                y: number,
                z: number
            ) => {
                for (let dz = 0; dz < IMZ; dz++) {
                    for (let dy = 0; dy < IMY; dy++) {
                        for (let dx = 0; dx < IMX; dx++) {
                            let sx = x + dx;
                            let sy = y + dy;
                            let sz = z + dz;

                            if (sx >= MX) sx -= MX;
                            if (sy >= MY) sy -= MY;
                            if (sz >= MZ) sz -= MZ;

                            const inputWave =
                                input[dx + dy * IMX + dz * IMX * IMY];
                            if (
                                (inputWave &
                                    (1 <<
                                        state[sx + sy * MX + sz * MX * MY])) ===
                                0
                            )
                                return false;
                        }
                    }
                }
                return true;
            };
        }

        // jit_map_apply_kernel
        if (output.length < Optimization.inline_limit) {
            const code: string[] = [];

            for (let dz = 0; dz < OMZ; dz++) {
                for (let dy = 0; dy < OMY; dy++) {
                    for (let dx = 0; dx < OMX; dx++) {
                        const o = output[dx + dy * OMX + dz * OMX * OMY];
                        if (o === 0xff) continue;
                        code.push(`
        {
            const sx = (x + ${dx}) % ${NX};
            const sy = (y + ${dy}) % ${NY};
            const sz = (z + ${dz}) % ${NZ};
            state[sx + sy * ${NX} + sz * ${NX * NY}] = ${o};
        }`);
                    }
                }
            }

            rule.jit_map_apply_kernel = <typeof rule.jit_map_apply_kernel>(
                new Function(
                    "state",
                    "x",
                    "y",
                    "z",
                    code.map((line) => " ".repeat(4) + line).join("\n")
                )
            );
        } else {
            rule.jit_map_apply_kernel = (
                state: Uint8Array,
                x: number,
                y: number,
                z: number
            ) => {
                for (let dz = 0; dz < OMZ; dz++) {
                    for (let dy = 0; dy < OMY; dy++) {
                        for (let dx = 0; dx < OMX; dx++) {
                            const o = output[dx + dy * OMX + dz * OMX * OMY];

                            if (o != 0xff) {
                                const sx = (x + dx) % NX;
                                const sy = (y + dy) % NY;
                                const sz = (z + dz) % NZ;

                                state[sx + sy * NX + sz * NX * NY] = o;
                            }
                        }
                    }
                }
            };
        }
    }
}
