import {BufferGeometry as BufferGeometry2} from "three/src/core/BufferGeometry";
import {Float32BufferAttribute} from "three/src/core/BufferAttribute";
import {Vector3 as Vector32} from "three/src/math/Vector3";
function azimuth(vector) {
  return Math.atan2(vector.z, -vector.x);
}
function inclination(vector) {
  return Math.atan2(-vector.y, Math.sqrt(vector.x * vector.x + vector.z * vector.z));
}
export class PolyhedronBufferGeometry extends BufferGeometry2 {
  constructor(vertices, indices, radius, detail, points_only) {
    super();
    this.type = "PolyhedronBufferGeometry";
    this.parameters = {
      vertices,
      indices,
      radius,
      detail
    };
    radius = radius || 1;
    detail = detail || 0;
    const vertexBuffer = [];
    const uvBuffer = [];
    const vertices_by_pos = new Map();
    subdivide(detail);
    applyRadius(radius);
    generateUVs();
    this.setAttribute("position", new Float32BufferAttribute(vertexBuffer, 3));
    this.setAttribute("uv", new Float32BufferAttribute(uvBuffer, 2));
    if (!points_only) {
      this.setAttribute("normal", new Float32BufferAttribute(vertexBuffer.slice(), 3));
      if (detail === 0) {
        this.computeVertexNormals();
      } else {
        this.normalizeNormals();
      }
    }
    function subdivide(detail2) {
      const a = new Vector32();
      const b = new Vector32();
      const c = new Vector32();
      for (let i = 0; i < indices.length; i += 3) {
        getVertexByIndex(indices[i + 0], a);
        getVertexByIndex(indices[i + 1], b);
        getVertexByIndex(indices[i + 2], c);
        subdivideFace(a, b, c, detail2);
      }
    }
    function subdivideFace(a, b, c, detail2) {
      const cols = detail2 + 1;
      const v = [];
      for (let i = 0; i <= cols; i++) {
        v[i] = [];
        const aj = a.clone().lerp(c, i / cols);
        const bj = b.clone().lerp(c, i / cols);
        const rows = cols - i;
        for (let j = 0; j <= rows; j++) {
          if (j === 0 && i === cols) {
            v[i][j] = aj;
          } else {
            v[i][j] = aj.clone().lerp(bj, j / rows);
          }
        }
      }
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < 2 * (cols - i) - 1; j++) {
          const k = Math.floor(j / 2);
          if (j % 2 === 0) {
            pushVertex(v[i][k + 1]);
            pushVertex(v[i + 1][k]);
            pushVertex(v[i][k]);
          } else {
            pushVertex(v[i][k + 1]);
            pushVertex(v[i + 1][k + 1]);
            pushVertex(v[i + 1][k]);
          }
        }
      }
    }
    function applyRadius(radius2) {
      const vertex = new Vector32();
      for (let i = 0; i < vertexBuffer.length; i += 3) {
        vertex.x = vertexBuffer[i + 0];
        vertex.y = vertexBuffer[i + 1];
        vertex.z = vertexBuffer[i + 2];
        vertex.normalize().multiplyScalar(radius2);
        vertexBuffer[i + 0] = vertex.x;
        vertexBuffer[i + 1] = vertex.y;
        vertexBuffer[i + 2] = vertex.z;
      }
    }
    function generateUVs() {
      const vertex = new Vector32();
      for (let i = 0; i < vertexBuffer.length; i += 3) {
        vertex.x = vertexBuffer[i + 0];
        vertex.y = vertexBuffer[i + 1];
        vertex.z = vertexBuffer[i + 2];
        const u = azimuth(vertex) / 2 / Math.PI + 0.5;
        const v = inclination(vertex) / Math.PI + 0.5;
        uvBuffer.push(u, 1 - v);
      }
    }
    function pushVertex(vertex) {
      if (points_only) {
        let mx = vertices_by_pos.get(vertex.x);
        if (mx) {
          const my2 = mx.get(vertex.y);
          if (my2 && my2.has(vertex.z)) {
            return;
          }
        }
        if (!mx) {
          mx = new Map();
          vertices_by_pos.set(vertex.x, mx);
        }
        let my = mx.get(vertex.y);
        if (!my) {
          my = new Set();
          mx.set(vertex.y, my);
        }
        my.add(vertex.z);
      }
      vertexBuffer.push(vertex.x, vertex.y, vertex.z);
    }
    function getVertexByIndex(index, vertex) {
      const stride = index * 3;
      vertex.x = vertices[stride + 0];
      vertex.y = vertices[stride + 1];
      vertex.z = vertices[stride + 2];
    }
  }
}
