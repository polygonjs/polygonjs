import { Grid } from "../grid";
import { Array2D } from "../helpers/datastructures";
import { Helper } from "../helpers/helper";
import { Node, RunState } from ".";

export class ConvolutionNode extends Node {
    public neighborhood: string;
    public rules: ConvolutionRule[];

    private kernel: Uint8Array;
    private periodic: boolean;
    public counter: number;
    public steps: number;

    private sumfield: Array2D<Int32Array>;

    static readonly kernels2d: Map<string, Uint8Array> = new Map([
        ["VonNeumann", new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0])],
        ["Moore", new Uint8Array([1, 1, 1, 1, 0, 1, 1, 1, 1])],
    ]);

    static readonly kernels3d: Map<string, Uint8Array> = new Map([
        [
            "VonNeumann",
            new Uint8Array([
                0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
                0, 1, 0, 0, 0, 0,
            ]),
        ],
        [
            "NoCorners",
            new Uint8Array([
                0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0,
                1, 1, 1, 0, 1, 0,
            ]),
        ],
    ]);

    public override async load(elem: Element, _: Uint8Array, grid: Grid) {
        const erules = [...Helper.childrenByTag(elem, "rule")];
        const elems = erules.length ? erules : [elem];

        this.rules = elems.map(() => new ConvolutionRule());

        if (!this.rules.every((r, i) => r.load(elems[i], grid))) return false;

        this.neighborhood = elem.getAttribute("neighborhood");
        this.kernel = (
            grid.MZ === 1
                ? ConvolutionNode.kernels2d
                : ConvolutionNode.kernels3d
        ).get(this.neighborhood);

        if (!this.kernel) {
            console.error(elem, "unknown kernel");
            return false;
        }

        this.steps = parseInt(elem.getAttribute("steps")) || -1;
        this.periodic = elem.getAttribute("periodic") === "True";
        this.sumfield = new Array2D(Int32Array, grid.C, grid.state.length, 0);

        return true;
    }

    public override reset() {
        this.counter = 0;
    }

    public override run() {
        if (this.steps > 0 && this.counter >= this.steps) return RunState.FAIL;

        const { grid, sumfield, periodic, kernel } = this;
        const { MX, MY, MZ } = grid;

        sumfield.fill(0);

        if (MZ == 1) {
            for (let y = 0; y < MY; y++)
                for (let x = 0; x < MX; x++) {
                    const sums = sumfield.row(x + y * MX);
                    for (let dy = -1; dy <= 1; dy++)
                        for (let dx = -1; dx <= 1; dx++) {
                            let sx = x + dx;
                            let sy = y + dy;

                            if (periodic) {
                                if (sx < 0) sx += MX;
                                else if (sx >= MX) sx -= MX;
                                if (sy < 0) sy += MY;
                                else if (sy >= MY) sy -= MY;
                            } else if (sx < 0 || sy < 0 || sx >= MX || sy >= MY)
                                continue;

                            sums[grid.state[sx + sy * MX]] +=
                                kernel[dx + 1 + (dy + 1) * 3];
                        }
                }
        } else {
            for (let z = 0; z < MZ; z++)
                for (let y = 0; y < MY; y++)
                    for (let x = 0; x < MX; x++) {
                        const sums = sumfield.row(x + y * MX + z * MX * MY);
                        for (let dz = -1; dz <= 1; dz++)
                            for (let dy = -1; dy <= 1; dy++)
                                for (let dx = -1; dx <= 1; dx++) {
                                    let sx = x + dx;
                                    let sy = y + dy;
                                    let sz = z + dz;

                                    if (periodic) {
                                        if (sx < 0) sx += MX;
                                        else if (sx >= MX) sx -= MX;
                                        if (sy < 0) sy += MY;
                                        else if (sy >= MY) sy -= MY;
                                        if (sz < 0) sz += MZ;
                                        else if (sz >= MZ) sz -= MZ;
                                    } else if (
                                        sx < 0 ||
                                        sy < 0 ||
                                        sz < 0 ||
                                        sx >= MX ||
                                        sy >= MY ||
                                        sz >= MZ
                                    )
                                        continue;

                                    sums[
                                        grid.state[sx + sy * MX + sz * MX * MY]
                                    ] +=
                                        kernel[
                                            dx + 1 + (dy + 1) * 3 + (dz + 1) * 9
                                        ];
                                }
                    }
        }

        let change = false;
        for (let i = 0; i < sumfield.ROWS; i++) {
            const sums = sumfield.row(i);
            const input = grid.state[i];
            for (const rule of this.rules) {
                if (
                    input == rule.input &&
                    rule.output != grid.state[i] &&
                    (rule.p == 1.0 || this.ip.rng.double() < rule.p)
                ) {
                    let success = true;
                    if (rule.sums != null) {
                        let sum = 0;
                        for (let c = 0; c < rule.values.length; c++)
                            sum += sums[rule.values[c]];
                        success = Boolean(rule.sums[sum]);
                    }
                    if (success) {
                        grid.state[i] = rule.output;
                        change = true;
                        break;
                    }
                }
            }
        }

        this.counter++;

        return change ? RunState.SUCCESS : RunState.FAIL;
    }
}

function* interval(s: string) {
    if (s.includes("..")) {
        const bounds = s.split("..");
        const min = parseInt(bounds[0]);
        const max = parseInt(bounds[1]);
        for (let i = min; i <= max; i++) yield i;
    } else yield parseInt(s);
}

export class ConvolutionRule {
    public input: number;
    public output: number;
    public values: Uint8Array;
    public sums: Uint8Array;
    public p: number;

    public load(elem: Element, grid: Grid) {
        this.input = grid.values.get(elem.getAttribute("in").charCodeAt(0));
        this.output = grid.values.get(elem.getAttribute("out").charCodeAt(0));
        const valueString = elem.getAttribute("values");
        const sumsString = elem.getAttribute("sum");

        if (valueString && !sumsString) {
            console.error(elem, 'missing "sum" attribute');
            return false;
        }

        if (!valueString && sumsString) {
            console.error(elem, 'missing "value" attribute');
            return false;
        }

        if (valueString)
            this.values = new Uint8Array(
                Array.from({ length: valueString.length }, (_, i) =>
                    grid.values.get(valueString.charCodeAt(i))
                )
            );

        this.p = parseFloat(elem.getAttribute("p")) || 1;

        if (sumsString) {
            this.sums = new Uint8Array(28);
            const intervals = sumsString.split(",");
            for (const s of intervals)
                for (const i of interval(s)) this.sums[i] = 1;
        }

        return true;
    }
}
