// export * from './CSG';

//
// I've done the following:
// 1. copied the files from https://github.com/Jiro-Digital/three-csg-ts
// 2. fixed some type issues
// 3. commented out the export line above in this file
// 4. and replaced the three import paths in the sibbling files
//
// so that:
//
// 1. the whole threejs module was not imported
// 2. boolean could be instanced, which is currently not the case as the generated Mesh appears different than the rest of the Mesh classes the other nodes generate
//
//
