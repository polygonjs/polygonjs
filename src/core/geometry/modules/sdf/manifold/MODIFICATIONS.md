The context of this folder is a modification of the content of the manifold-3d npm module, from https://github.com/elalish/manifold

The modifications are:

-   format manifold.js with prettier
-   remove the content of the 3 `if (ENVIRONMENT_IS_NODE) {}` blocks
-   comment out the line `wasmBinaryFile = new URL('manifold.wasm', import.meta.url).href;`
