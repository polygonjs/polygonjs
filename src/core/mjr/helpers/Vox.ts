import Reader from "./reader";
import Writer from "./writer";

export class VoxHelper {
    static read(buffer: ArrayBuffer): [Int32Array, number, number, number] {
        const r = new Reader(new DataView(buffer));
        let result: Int32Array = null;
        let MX = -1,
            MY = -1,
            MZ = -1;

        const magic = r.chars(4);
        const version = r.i32();

        // console.log(`${magic}version: ${version}`);

        while (!r.EOF) {
            const head = r.chars(1);

            if (head === "S") {
                const tail = r.chars(3);

                if (tail !== "IZE") continue;

                const chunkSize = r.i32();
                r.skip(4);
                MX = r.i32();
                MY = r.i32();
                MZ = r.i32();
                r.skip(chunkSize - 4 * 3);
            } else if (head === "X") {
                const tail = r.chars(3);

                if (tail !== "YZI") continue;

                if (MX <= 0 || MY <= 0 || MZ <= 0) return [null, MX, MY, MZ];
                result = new Int32Array(MX * MY * MZ);
                result.fill(-1);

                r.skip(8);
                const numVoxels = r.i32();
                for (let i = 0; i < numVoxels; i++) {
                    const x = r.u8();
                    const y = r.u8();
                    const z = r.u8();
                    const color = r.u8();
                    result[x + y * MX + z * MX * MY] = color;
                }
            }
        }

        return [result, MX, MY, MZ];
    }

    static serialize(
        state: Uint8Array,
        MX: number,
        MY: number,
        MZ: number,
        palette: Uint8ClampedArray[]
    ) {
        const voxelBuf = new Uint8Array(MX * MY * MZ * 4);
        let voxels = 0;

        for (let z = 0; z < MZ; z++)
            for (let y = 0; y < MY; y++)
                for (let x = 0; x < MX; x++) {
                    const i = x + y * MX + z * MX * MY;
                    const v = state[i];
                    if (v) {
                        const o = voxels << 2;
                        voxelBuf[o + 0] = x;
                        voxelBuf[o + 1] = y;
                        voxelBuf[o + 2] = z;
                        voxelBuf[o + 3] = v + 1;
                        voxels++;
                    }
                }

        const w = new Writer();
        w.utf8("VOX ", false, false);
        w.i32(150); // version

        w.utf8("MAIN", false, false);
        w.i32(0);
        w.i32(1092 + voxels * 4);

        w.utf8("PACK", false, false);
        w.i32(4);
        w.i32(0);
        w.i32(1);

        w.utf8("SIZE", false, false);
        w.i32(12);
        w.i32(0);
        w.i32(MX);
        w.i32(MY);
        w.i32(MZ);

        w.utf8("XYZI", false, false);
        w.i32(4 + voxels * 4);
        w.i32(0);
        w.i32(voxels);

        w.buf(voxelBuf.subarray(0, voxels * 4));

        w.utf8("RGBA", false, false);
        w.i32(1024);
        w.i32(0);

        for (const c of palette) {
            w.u8(c[0]);
            w.u8(c[1]);
            w.u8(c[2]);
            w.u8(0);
        }

        for (let i = palette.length; i < 255; i++) {
            w.u8(0xff - i - 1);
            w.u8(0xff - i - 1);
            w.u8(0xff - i - 1);
            w.u8(0xff);
        }

        w.i32(0);

        return w.output();
    }
}
