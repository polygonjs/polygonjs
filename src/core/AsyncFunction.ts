// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
export const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
// be careful as this currently does not export well with esbuild. To investigate
