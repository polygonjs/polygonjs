import {BufferGeometry, Vector3, Float32BufferAttribute} from 'three';

interface SphereBuilderParams {
	radius: number;
	widthSegments: number;
	heightSegments: number;
	phiStart?: number;
	phiLength?: number;
	thetaStart?: number;
	thetaLength?: number;
	asLines?: boolean;
	open?: boolean;
}

export class SphereBuilder {
	static create(parameters: SphereBuilderParams) {
		const geometry = new BufferGeometry();
		(geometry as any).type = 'SphereBuilder';

		let {radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, asLines, open} =
			parameters;
		if (phiStart == null) {
			phiStart = 0;
		}
		if (phiLength == null) {
			phiLength = Math.PI * 2;
		}
		if (thetaStart == null) {
			thetaStart = 0;
		}
		if (thetaLength == null) {
			thetaLength = Math.PI;
		}
		if (open == null) {
			open = false;
		}

		widthSegments = Math.max(3, Math.floor(widthSegments));
		heightSegments = Math.max(2, Math.floor(heightSegments));

		const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

		let index = 0;
		const grid = [];

		const vertex = new Vector3();
		const normal = new Vector3();

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs

		for (let iy = 0; iy <= heightSegments; iy++) {
			const verticesRow = [];

			const v = iy / heightSegments;

			// special case for the poles

			let uOffset = 0;

			if (iy == 0 && thetaStart == 0) {
				uOffset = 0.5 / widthSegments;
			} else if (iy == heightSegments && thetaEnd == Math.PI) {
				uOffset = -0.5 / widthSegments;
			}

			for (let ix = 0; ix <= widthSegments; ix++) {
				const u = ix / widthSegments;

				// vertex

				vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
				vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
				vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

				vertices.push(vertex.x, vertex.y, vertex.z);

				// normal

				normal.copy(vertex).normalize();
				normals.push(normal.x, normal.y, normal.z);

				// uv

				uvs.push(u + uOffset, 1 - v);

				verticesRow.push(index++);
			}

			grid.push(verticesRow);
		}

		// indices

		for (let iy = 0; iy < heightSegments; iy++) {
			for (let ix = 0; ix < widthSegments; ix++) {
				const a = grid[iy][ix + 1];
				const b = grid[iy][ix];
				const c = grid[iy + 1][ix];
				const d = grid[iy + 1][ix + 1];

				if (asLines) {
					if (iy !== 0 || thetaStart > 0) indices.push(a, b);
					indices.push(b, c);
					if (open) {
						if (ix < widthSegments - 1) {
							indices.push(c, d);
						}
						if (iy < heightSegments - 1) {
							indices.push(a, d);
						}
					}
				} else {
					if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
					if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
				}
			}
		}
		// 2 last segments if open
		if (open) {
			const a = grid[heightSegments][widthSegments - 1];
			const b = grid[heightSegments][widthSegments];
			indices.push(a, b);
			const c = grid[heightSegments - 1][widthSegments];
			const d = grid[heightSegments][widthSegments];
			indices.push(c, d);
		}

		// build geometry

		geometry.setIndex(indices);
		geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
		geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
		geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
		return geometry;
	}
}
