import { Grid } from "../grid";
import { Loader } from "../loader";
import { Helper, range } from "../helpers/helper";
import { SymmetryHelper } from "../helpers/symmetry";
import { Node, RunState } from ".";

export class ConvChainNode extends Node {
    private N: number;
    private temperature: number;
    private weights: Float64Array;

    public c0: number;
    public c1: number;
    private substrate: Uint8Array;
    private substrateColor: number;

    public counter: number;
    public steps: number;

    public sample: Uint8Array;
    public SMX: number;
    public SMY: number;

    public override async load(elem: Element, _: Uint8Array, grid: Grid) {
        if (grid.MZ !== 1) {
            console.error("convchain currently works only for 2d");
            return false;
        }

        const name = elem.getAttribute("sample");
        const filename = `resources/samples/${name}.png`;

        const result = await Loader.bitmap(filename);

        const bitmap = result[0];
        this.SMX = result[1];
        this.SMY = result[2];

        if (!bitmap) {
            console.error(`Failed to load ConvChain sample ${filename}`);
            return false;
        }
        this.sample = new Uint8Array(bitmap.length);
        for (let i = 0; i < this.sample.length; i++)
            this.sample[i] = Number(bitmap[i] == -1);

        const N = (this.N = parseInt(elem.getAttribute("n")) || 3);
        this.steps = parseInt(elem.getAttribute("steps")) || -1;
        this.temperature = parseFloat(elem.getAttribute("temperature")) || 1;
        this.c0 = grid.values.get(elem.getAttribute("black").charCodeAt(0));
        this.c1 = grid.values.get(elem.getAttribute("white").charCodeAt(0));
        this.substrateColor = grid.values.get(
            elem.getAttribute("on").charCodeAt(0)
        );

        this.substrate = new Uint8Array(grid.state.length);
        this.weights = new Float64Array(1 << (N * N));

        const { SMX, SMY, sample, weights } = this;

        for (let y = 0; y < SMY; y++)
            for (let x = 0; x < SMX; x++) {
                const p = pattern(
                    N,
                    (dx, dy) =>
                        sample[((x + dx) % SMX) + ((y + dy) % SMY) * SMX]
                );
                const symmetries = SymmetryHelper.squareSymmetries(
                    p,
                    (q) => rotate(N, q),
                    (q) => reflect(N, q),
                    (_) => false
                );
                for (const q of symmetries)
                    weights[Helper.indexBoolArr(q)] += 1;
            }

        for (let k = 0; k < weights.length; k++)
            if (weights[k] <= 0) weights[k] = 0.1;
        return true;
    }

    private toggle(state: Uint8Array, i: number) {
        state[i] = state[i] == this.c0 ? this.c1 : this.c0;
    }

    public override run() {
        if (this.steps > 0 && this.counter >= this.steps) return RunState.FAIL;

        const {
            grid,
            c0,
            c1,
            substrate,
            ip,
            N,
            weights,
            temperature,
            substrateColor,
        } = this;
        const { MX, MY, state } = grid;

        if (!this.counter) {
            let anySubstrate = false;
            for (let i = 0; i < substrate.length; i++)
                if (state[i] === substrateColor) {
                    state[i] = range(ip.rng, 2) == 0 ? c0 : c1;
                    substrate[i] = 1;
                    anySubstrate = true;
                }
            this.counter++;
            return anySubstrate ? RunState.SUCCESS : RunState.FAIL;
        }

        for (let k = 0; k < state.length; k++) {
            let r = range(ip.rng, state.length);
            if (!substrate[r]) continue;

            const x = r % MX;
            const y = ~~(r / MX);
            let q = 1;

            for (let sy = y - N + 1; sy <= y + N - 1; sy++)
                for (let sx = x - N + 1; sx <= x + N - 1; sx++) {
                    let ind = 0,
                        difference = 0;
                    for (let dy = 0; dy < N; dy++)
                        for (let dx = 0; dx < N; dx++) {
                            const X = (sx + dx + MX) % MX;
                            const Y = (sy + dy + MY) % MY;

                            const value = state[X + Y * MX] == c1;
                            const power = 1 << (dy * N + dx);
                            ind += value ? power : 0;
                            if (X === x && Y === y)
                                difference = value ? power : -power;
                        }

                    q *= weights[ind - difference] / weights[ind];
                }

            if (q >= 1) {
                this.toggle(state, r);
                continue;
            }
            if (temperature != 1) q = Math.pow(q, 1.0 / temperature);
            if (q > ip.rng.double()) this.toggle(state, r);
        }

        this.counter++;
        return RunState.SUCCESS;
    }

    public override reset() {
        this.substrate.fill(0);
        this.counter = 0;
    }
}

const pattern = (N: number, f: (n1: number, n2: number) => number) => {
    const result = new Uint8Array(N * N);
    for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) result[x + y * N] = f(x, y);
    return result;
};

const rotate = (N: number, p: Uint8Array) =>
    pattern(N, (x, y) => p[N - 1 - y + x * N]);
const reflect = (N: number, p: Uint8Array) =>
    pattern(N, (x, y) => p[N - 1 - x + y * N]);
