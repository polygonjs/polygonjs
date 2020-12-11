const OBJLoader2Parser = function() {
  this.logging = {
    enabled: false,
    debug: false
  };
  const scope = this;
  this.callbacks = {
    onProgress: function(text) {
      scope._onProgress(text);
    },
    onAssetAvailable: function(payload) {
      scope._onAssetAvailable(payload);
    },
    onError: function(errorMessage) {
      scope._onError(errorMessage);
    },
    onLoad: function(object3d, message) {
      scope._onLoad(object3d, message);
    }
  };
  this.contentRef = null;
  this.legacyMode = false;
  this.materials = {};
  this.materialPerSmoothingGroup = false;
  this.useOAsMesh = false;
  this.useIndices = false;
  this.disregardNormals = false;
  this.vertices = [];
  this.colors = [];
  this.normals = [];
  this.uvs = [];
  this.rawMesh = {
    objectName: "",
    groupName: "",
    activeMtlName: "",
    mtllibName: "",
    faceType: -1,
    subGroups: [],
    subGroupInUse: null,
    smoothingGroup: {
      splitMaterials: false,
      normalized: -1,
      real: -1
    },
    counts: {
      doubleIndicesCount: 0,
      faceCount: 0,
      mtlCount: 0,
      smoothingGroupCount: 0
    }
  };
  this.inputObjectCount = 1;
  this.outputObjectCount = 1;
  this.globalCounts = {
    vertices: 0,
    faces: 0,
    doubleIndicesCount: 0,
    lineByte: 0,
    currentByte: 0,
    totalBytes: 0
  };
};
OBJLoader2Parser.prototype = {
  constructor: OBJLoader2Parser,
  _resetRawMesh: function() {
    this.rawMesh.subGroups = [];
    this.rawMesh.subGroupInUse = null;
    this.rawMesh.smoothingGroup.normalized = -1;
    this.rawMesh.smoothingGroup.real = -1;
    this._pushSmoothingGroup(1);
    this.rawMesh.counts.doubleIndicesCount = 0;
    this.rawMesh.counts.faceCount = 0;
    this.rawMesh.counts.mtlCount = 0;
    this.rawMesh.counts.smoothingGroupCount = 0;
  },
  setMaterialPerSmoothingGroup: function(materialPerSmoothingGroup) {
    this.materialPerSmoothingGroup = materialPerSmoothingGroup === true;
    return this;
  },
  setUseOAsMesh: function(useOAsMesh) {
    this.useOAsMesh = useOAsMesh === true;
    return this;
  },
  setUseIndices: function(useIndices) {
    this.useIndices = useIndices === true;
    return this;
  },
  setDisregardNormals: function(disregardNormals) {
    this.disregardNormals = disregardNormals === true;
    return this;
  },
  setMaterials: function(materials) {
    this.materials = Object.assign({}, materials);
  },
  setCallbackOnAssetAvailable: function(onAssetAvailable) {
    if (onAssetAvailable !== null && onAssetAvailable !== void 0 && onAssetAvailable instanceof Function) {
      this.callbacks.onAssetAvailable = onAssetAvailable;
    }
    return this;
  },
  setCallbackOnProgress: function(onProgress) {
    if (onProgress !== null && onProgress !== void 0 && onProgress instanceof Function) {
      this.callbacks.onProgress = onProgress;
    }
    return this;
  },
  setCallbackOnError: function(onError) {
    if (onError !== null && onError !== void 0 && onError instanceof Function) {
      this.callbacks.onError = onError;
    }
    return this;
  },
  setCallbackOnLoad: function(onLoad) {
    if (onLoad !== null && onLoad !== void 0 && onLoad instanceof Function) {
      this.callbacks.onLoad = onLoad;
    }
    return this;
  },
  _onProgress: function(text) {
    const message = text ? text : "";
    if (this.logging.enabled && this.logging.debug) {
      console.log(message);
    }
  },
  _onError: function(errorMessage) {
    if (this.logging.enabled && this.logging.debug) {
      console.error(errorMessage);
    }
  },
  _onAssetAvailable: function() {
    const errorMessage = "OBJLoader2Parser does not provide implementation for onAssetAvailable. Aborting...";
    this.callbacks.onError(errorMessage);
    throw errorMessage;
  },
  _onLoad: function(object3d, message) {
    console.log("You reached parser default onLoad callback: " + message);
  },
  setLogging: function(enabled, debug) {
    this.logging.enabled = enabled === true;
    this.logging.debug = debug === true;
    return this;
  },
  _configure: function() {
    this._pushSmoothingGroup(1);
    if (this.logging.enabled) {
      const matKeys = Object.keys(this.materials);
      const matNames = matKeys.length > 0 ? "\n	materialNames:\n		- " + matKeys.join("\n		- ") : "\n	materialNames: None";
      let printedConfig = "OBJLoader.Parser configuration:" + matNames + "\n	materialPerSmoothingGroup: " + this.materialPerSmoothingGroup + "\n	useOAsMesh: " + this.useOAsMesh + "\n	useIndices: " + this.useIndices + "\n	disregardNormals: " + this.disregardNormals;
      printedConfig += "\n	callbacks.onProgress: " + this.callbacks.onProgress.name;
      printedConfig += "\n	callbacks.onAssetAvailable: " + this.callbacks.onAssetAvailable.name;
      printedConfig += "\n	callbacks.onError: " + this.callbacks.onError.name;
      console.info(printedConfig);
    }
  },
  execute: function(arrayBuffer) {
    if (this.logging.enabled)
      console.time("OBJLoader2Parser.execute");
    this._configure();
    const arrayBufferView = new Uint8Array(arrayBuffer);
    this.contentRef = arrayBufferView;
    const length = arrayBufferView.byteLength;
    this.globalCounts.totalBytes = length;
    const buffer = new Array(128);
    let bufferPointer = 0;
    let slashesCount = 0;
    let word = "";
    let currentByte = 0;
    for (let code; currentByte < length; currentByte++) {
      code = arrayBufferView[currentByte];
      switch (code) {
        case 32:
          if (word.length > 0)
            buffer[bufferPointer++] = word;
          word = "";
          break;
        case 47:
          if (word.length > 0)
            buffer[bufferPointer++] = word;
          slashesCount++;
          word = "";
          break;
        case 10:
          this._processLine(buffer, bufferPointer, slashesCount, word, currentByte);
          word = "";
          bufferPointer = 0;
          slashesCount = 0;
          break;
        case 13:
          break;
        default:
          word += String.fromCharCode(code);
          break;
      }
    }
    this._processLine(buffer, bufferPointer, slashesCount, word, currentByte);
    this._finalizeParsing();
    if (this.logging.enabled)
      console.timeEnd("OBJLoader2Parser.execute");
  },
  executeLegacy: function(text) {
    if (this.logging.enabled)
      console.time("OBJLoader2Parser.executeLegacy");
    this._configure();
    this.legacyMode = true;
    this.contentRef = text;
    const length = text.length;
    this.globalCounts.totalBytes = length;
    const buffer = new Array(128);
    let bufferPointer = 0;
    let slashesCount = 0;
    let word = "";
    let currentByte = 0;
    for (let char; currentByte < length; currentByte++) {
      char = text[currentByte];
      switch (char) {
        case " ":
          if (word.length > 0)
            buffer[bufferPointer++] = word;
          word = "";
          break;
        case "/":
          if (word.length > 0)
            buffer[bufferPointer++] = word;
          slashesCount++;
          word = "";
          break;
        case "\n":
          this._processLine(buffer, bufferPointer, slashesCount, word, currentByte);
          word = "";
          bufferPointer = 0;
          slashesCount = 0;
          break;
        case "\r":
          break;
        default:
          word += char;
      }
    }
    this._processLine(buffer, bufferPointer, word, slashesCount);
    this._finalizeParsing();
    if (this.logging.enabled)
      console.timeEnd("OBJLoader2Parser.executeLegacy");
  },
  _processLine: function(buffer, bufferPointer, slashesCount, word, currentByte) {
    this.globalCounts.lineByte = this.globalCounts.currentByte;
    this.globalCounts.currentByte = currentByte;
    if (bufferPointer < 1)
      return;
    if (word.length > 0)
      buffer[bufferPointer++] = word;
    const reconstructString = function(content, legacyMode, start, stop) {
      let line = "";
      if (stop > start) {
        let i2;
        if (legacyMode) {
          for (i2 = start; i2 < stop; i2++)
            line += content[i2];
        } else {
          for (i2 = start; i2 < stop; i2++)
            line += String.fromCharCode(content[i2]);
        }
        line = line.trim();
      }
      return line;
    };
    let bufferLength, length, i;
    const lineDesignation = buffer[0];
    switch (lineDesignation) {
      case "v":
        this.vertices.push(parseFloat(buffer[1]));
        this.vertices.push(parseFloat(buffer[2]));
        this.vertices.push(parseFloat(buffer[3]));
        if (bufferPointer > 4) {
          this.colors.push(parseFloat(buffer[4]));
          this.colors.push(parseFloat(buffer[5]));
          this.colors.push(parseFloat(buffer[6]));
        }
        break;
      case "vt":
        this.uvs.push(parseFloat(buffer[1]));
        this.uvs.push(parseFloat(buffer[2]));
        break;
      case "vn":
        this.normals.push(parseFloat(buffer[1]));
        this.normals.push(parseFloat(buffer[2]));
        this.normals.push(parseFloat(buffer[3]));
        break;
      case "f":
        bufferLength = bufferPointer - 1;
        if (slashesCount === 0) {
          this._checkFaceType(0);
          for (i = 2, length = bufferLength; i < length; i++) {
            this._buildFace(buffer[1]);
            this._buildFace(buffer[i]);
            this._buildFace(buffer[i + 1]);
          }
        } else if (bufferLength === slashesCount * 2) {
          this._checkFaceType(1);
          for (i = 3, length = bufferLength - 2; i < length; i += 2) {
            this._buildFace(buffer[1], buffer[2]);
            this._buildFace(buffer[i], buffer[i + 1]);
            this._buildFace(buffer[i + 2], buffer[i + 3]);
          }
        } else if (bufferLength * 2 === slashesCount * 3) {
          this._checkFaceType(2);
          for (i = 4, length = bufferLength - 3; i < length; i += 3) {
            this._buildFace(buffer[1], buffer[2], buffer[3]);
            this._buildFace(buffer[i], buffer[i + 1], buffer[i + 2]);
            this._buildFace(buffer[i + 3], buffer[i + 4], buffer[i + 5]);
          }
        } else {
          this._checkFaceType(3);
          for (i = 3, length = bufferLength - 2; i < length; i += 2) {
            this._buildFace(buffer[1], void 0, buffer[2]);
            this._buildFace(buffer[i], void 0, buffer[i + 1]);
            this._buildFace(buffer[i + 2], void 0, buffer[i + 3]);
          }
        }
        break;
      case "l":
      case "p":
        bufferLength = bufferPointer - 1;
        if (bufferLength === slashesCount * 2) {
          this._checkFaceType(4);
          for (i = 1, length = bufferLength + 1; i < length; i += 2)
            this._buildFace(buffer[i], buffer[i + 1]);
        } else {
          this._checkFaceType(lineDesignation === "l" ? 5 : 6);
          for (i = 1, length = bufferLength + 1; i < length; i++)
            this._buildFace(buffer[i]);
        }
        break;
      case "s":
        this._pushSmoothingGroup(buffer[1]);
        break;
      case "g":
        this._processCompletedMesh();
        this.rawMesh.groupName = reconstructString(this.contentRef, this.legacyMode, this.globalCounts.lineByte + 2, this.globalCounts.currentByte);
        break;
      case "o":
        if (this.useOAsMesh)
          this._processCompletedMesh();
        this.rawMesh.objectName = reconstructString(this.contentRef, this.legacyMode, this.globalCounts.lineByte + 2, this.globalCounts.currentByte);
        break;
      case "mtllib":
        this.rawMesh.mtllibName = reconstructString(this.contentRef, this.legacyMode, this.globalCounts.lineByte + 7, this.globalCounts.currentByte);
        break;
      case "usemtl":
        const mtlName = reconstructString(this.contentRef, this.legacyMode, this.globalCounts.lineByte + 7, this.globalCounts.currentByte);
        if (mtlName !== "" && this.rawMesh.activeMtlName !== mtlName) {
          this.rawMesh.activeMtlName = mtlName;
          this.rawMesh.counts.mtlCount++;
          this._checkSubGroup();
        }
        break;
      default:
        break;
    }
  },
  _pushSmoothingGroup: function(smoothingGroup) {
    let smoothingGroupInt = parseInt(smoothingGroup);
    if (isNaN(smoothingGroupInt)) {
      smoothingGroupInt = smoothingGroup === "off" ? 0 : 1;
    }
    const smoothCheck = this.rawMesh.smoothingGroup.normalized;
    this.rawMesh.smoothingGroup.normalized = this.rawMesh.smoothingGroup.splitMaterials ? smoothingGroupInt : smoothingGroupInt === 0 ? 0 : 1;
    this.rawMesh.smoothingGroup.real = smoothingGroupInt;
    if (smoothCheck !== smoothingGroupInt) {
      this.rawMesh.counts.smoothingGroupCount++;
      this._checkSubGroup();
    }
  },
  _checkFaceType: function(faceType) {
    if (this.rawMesh.faceType !== faceType) {
      this._processCompletedMesh();
      this.rawMesh.faceType = faceType;
      this._checkSubGroup();
    }
  },
  _checkSubGroup: function() {
    const index = this.rawMesh.activeMtlName + "|" + this.rawMesh.smoothingGroup.normalized;
    this.rawMesh.subGroupInUse = this.rawMesh.subGroups[index];
    if (this.rawMesh.subGroupInUse === void 0 || this.rawMesh.subGroupInUse === null) {
      this.rawMesh.subGroupInUse = {
        index,
        objectName: this.rawMesh.objectName,
        groupName: this.rawMesh.groupName,
        materialName: this.rawMesh.activeMtlName,
        smoothingGroup: this.rawMesh.smoothingGroup.normalized,
        vertices: [],
        indexMappingsCount: 0,
        indexMappings: [],
        indices: [],
        colors: [],
        uvs: [],
        normals: []
      };
      this.rawMesh.subGroups[index] = this.rawMesh.subGroupInUse;
    }
  },
  _buildFace: function(faceIndexV, faceIndexU, faceIndexN) {
    const subGroupInUse = this.rawMesh.subGroupInUse;
    const scope = this;
    const updateSubGroupInUse = function() {
      const faceIndexVi = parseInt(faceIndexV);
      let indexPointerV = 3 * (faceIndexVi > 0 ? faceIndexVi - 1 : faceIndexVi + scope.vertices.length / 3);
      let indexPointerC = scope.colors.length > 0 ? indexPointerV : null;
      const vertices = subGroupInUse.vertices;
      vertices.push(scope.vertices[indexPointerV++]);
      vertices.push(scope.vertices[indexPointerV++]);
      vertices.push(scope.vertices[indexPointerV]);
      if (indexPointerC !== null) {
        const colors = subGroupInUse.colors;
        colors.push(scope.colors[indexPointerC++]);
        colors.push(scope.colors[indexPointerC++]);
        colors.push(scope.colors[indexPointerC]);
      }
      if (faceIndexU) {
        const faceIndexUi = parseInt(faceIndexU);
        let indexPointerU = 2 * (faceIndexUi > 0 ? faceIndexUi - 1 : faceIndexUi + scope.uvs.length / 2);
        const uvs = subGroupInUse.uvs;
        uvs.push(scope.uvs[indexPointerU++]);
        uvs.push(scope.uvs[indexPointerU]);
      }
      if (faceIndexN && !scope.disregardNormals) {
        const faceIndexNi = parseInt(faceIndexN);
        let indexPointerN = 3 * (faceIndexNi > 0 ? faceIndexNi - 1 : faceIndexNi + scope.normals.length / 3);
        const normals = subGroupInUse.normals;
        normals.push(scope.normals[indexPointerN++]);
        normals.push(scope.normals[indexPointerN++]);
        normals.push(scope.normals[indexPointerN]);
      }
    };
    if (this.useIndices) {
      if (this.disregardNormals)
        faceIndexN = void 0;
      const mappingName = faceIndexV + (faceIndexU ? "_" + faceIndexU : "_n") + (faceIndexN ? "_" + faceIndexN : "_n");
      let indicesPointer = subGroupInUse.indexMappings[mappingName];
      if (indicesPointer === void 0 || indicesPointer === null) {
        indicesPointer = this.rawMesh.subGroupInUse.vertices.length / 3;
        updateSubGroupInUse();
        subGroupInUse.indexMappings[mappingName] = indicesPointer;
        subGroupInUse.indexMappingsCount++;
      } else {
        this.rawMesh.counts.doubleIndicesCount++;
      }
      subGroupInUse.indices.push(indicesPointer);
    } else {
      updateSubGroupInUse();
    }
    this.rawMesh.counts.faceCount++;
  },
  _createRawMeshReport: function(inputObjectCount) {
    return "Input Object number: " + inputObjectCount + "\n	Object name: " + this.rawMesh.objectName + "\n	Group name: " + this.rawMesh.groupName + "\n	Mtllib name: " + this.rawMesh.mtllibName + "\n	Vertex count: " + this.vertices.length / 3 + "\n	Normal count: " + this.normals.length / 3 + "\n	UV count: " + this.uvs.length / 2 + "\n	SmoothingGroup count: " + this.rawMesh.counts.smoothingGroupCount + "\n	Material count: " + this.rawMesh.counts.mtlCount + "\n	Real MeshOutputGroup count: " + this.rawMesh.subGroups.length;
  },
  _finalizeRawMesh: function() {
    const meshOutputGroupTemp = [];
    let meshOutputGroup;
    let absoluteVertexCount = 0;
    let absoluteIndexMappingsCount = 0;
    let absoluteIndexCount = 0;
    let absoluteColorCount = 0;
    let absoluteNormalCount = 0;
    let absoluteUvCount = 0;
    let indices;
    for (const name in this.rawMesh.subGroups) {
      meshOutputGroup = this.rawMesh.subGroups[name];
      if (meshOutputGroup.vertices.length > 0) {
        indices = meshOutputGroup.indices;
        if (indices.length > 0 && absoluteIndexMappingsCount > 0) {
          for (let i = 0; i < indices.length; i++) {
            indices[i] = indices[i] + absoluteIndexMappingsCount;
          }
        }
        meshOutputGroupTemp.push(meshOutputGroup);
        absoluteVertexCount += meshOutputGroup.vertices.length;
        absoluteIndexMappingsCount += meshOutputGroup.indexMappingsCount;
        absoluteIndexCount += meshOutputGroup.indices.length;
        absoluteColorCount += meshOutputGroup.colors.length;
        absoluteUvCount += meshOutputGroup.uvs.length;
        absoluteNormalCount += meshOutputGroup.normals.length;
      }
    }
    let result = null;
    if (meshOutputGroupTemp.length > 0) {
      result = {
        name: this.rawMesh.groupName !== "" ? this.rawMesh.groupName : this.rawMesh.objectName,
        subGroups: meshOutputGroupTemp,
        absoluteVertexCount,
        absoluteIndexCount,
        absoluteColorCount,
        absoluteNormalCount,
        absoluteUvCount,
        faceCount: this.rawMesh.counts.faceCount,
        doubleIndicesCount: this.rawMesh.counts.doubleIndicesCount
      };
    }
    return result;
  },
  _processCompletedMesh: function() {
    const result = this._finalizeRawMesh();
    const haveMesh = result !== null;
    if (haveMesh) {
      if (this.colors.length > 0 && this.colors.length !== this.vertices.length) {
        this.callbacks.onError("Vertex Colors were detected, but vertex count and color count do not match!");
      }
      if (this.logging.enabled && this.logging.debug)
        console.debug(this._createRawMeshReport(this.inputObjectCount));
      this.inputObjectCount++;
      this._buildMesh(result);
      const progressBytesPercent = this.globalCounts.currentByte / this.globalCounts.totalBytes;
      this._onProgress("Completed [o: " + this.rawMesh.objectName + " g:" + this.rawMesh.groupName + "] Total progress: " + (progressBytesPercent * 100).toFixed(2) + "%");
      this._resetRawMesh();
    }
    return haveMesh;
  },
  _buildMesh: function(result) {
    const meshOutputGroups = result.subGroups;
    const vertexFA = new Float32Array(result.absoluteVertexCount);
    this.globalCounts.vertices += result.absoluteVertexCount / 3;
    this.globalCounts.faces += result.faceCount;
    this.globalCounts.doubleIndicesCount += result.doubleIndicesCount;
    const indexUA = result.absoluteIndexCount > 0 ? new Uint32Array(result.absoluteIndexCount) : null;
    const colorFA = result.absoluteColorCount > 0 ? new Float32Array(result.absoluteColorCount) : null;
    const normalFA = result.absoluteNormalCount > 0 ? new Float32Array(result.absoluteNormalCount) : null;
    const uvFA = result.absoluteUvCount > 0 ? new Float32Array(result.absoluteUvCount) : null;
    const haveVertexColors = colorFA !== null;
    let meshOutputGroup;
    const materialNames = [];
    const createMultiMaterial = meshOutputGroups.length > 1;
    let materialIndex = 0;
    const materialIndexMapping = [];
    let selectedMaterialIndex;
    let materialGroup;
    const materialGroups = [];
    let vertexFAOffset = 0;
    let indexUAOffset = 0;
    let colorFAOffset = 0;
    let normalFAOffset = 0;
    let uvFAOffset = 0;
    let materialGroupOffset = 0;
    let materialGroupLength = 0;
    let materialOrg, material, materialName, materialNameOrg;
    for (const oodIndex in meshOutputGroups) {
      if (!meshOutputGroups.hasOwnProperty(oodIndex))
        continue;
      meshOutputGroup = meshOutputGroups[oodIndex];
      materialNameOrg = meshOutputGroup.materialName;
      if (this.rawMesh.faceType < 4) {
        materialName = materialNameOrg + (haveVertexColors ? "_vertexColor" : "") + (meshOutputGroup.smoothingGroup === 0 ? "_flat" : "");
      } else {
        materialName = this.rawMesh.faceType === 6 ? "defaultPointMaterial" : "defaultLineMaterial";
      }
      materialOrg = this.materials[materialNameOrg];
      material = this.materials[materialName];
      if ((materialOrg === void 0 || materialOrg === null) && (material === void 0 || material === null)) {
        materialName = haveVertexColors ? "defaultVertexColorMaterial" : "defaultMaterial";
        material = this.materials[materialName];
        if (this.logging.enabled) {
          console.info('object_group "' + meshOutputGroup.objectName + "_" + meshOutputGroup.groupName + '" was defined with unresolvable material "' + materialNameOrg + '"! Assigning "' + materialName + '".');
        }
      }
      if (material === void 0 || material === null) {
        const materialCloneInstructions = {
          materialNameOrg,
          materialName,
          materialProperties: {
            vertexColors: haveVertexColors ? 2 : 0,
            flatShading: meshOutputGroup.smoothingGroup === 0
          }
        };
        const payload = {
          cmd: "assetAvailable",
          type: "material",
          materials: {
            materialCloneInstructions
          }
        };
        this.callbacks.onAssetAvailable(payload);
        const matCheck = this.materials[materialName];
        if (matCheck === void 0 || matCheck === null) {
          this.materials[materialName] = materialCloneInstructions;
        }
      }
      if (createMultiMaterial) {
        selectedMaterialIndex = materialIndexMapping[materialName];
        if (!selectedMaterialIndex) {
          selectedMaterialIndex = materialIndex;
          materialIndexMapping[materialName] = materialIndex;
          materialNames.push(materialName);
          materialIndex++;
        }
        materialGroupLength = this.useIndices ? meshOutputGroup.indices.length : meshOutputGroup.vertices.length / 3;
        materialGroup = {
          start: materialGroupOffset,
          count: materialGroupLength,
          index: selectedMaterialIndex
        };
        materialGroups.push(materialGroup);
        materialGroupOffset += materialGroupLength;
      } else {
        materialNames.push(materialName);
      }
      vertexFA.set(meshOutputGroup.vertices, vertexFAOffset);
      vertexFAOffset += meshOutputGroup.vertices.length;
      if (indexUA) {
        indexUA.set(meshOutputGroup.indices, indexUAOffset);
        indexUAOffset += meshOutputGroup.indices.length;
      }
      if (colorFA) {
        colorFA.set(meshOutputGroup.colors, colorFAOffset);
        colorFAOffset += meshOutputGroup.colors.length;
      }
      if (normalFA) {
        normalFA.set(meshOutputGroup.normals, normalFAOffset);
        normalFAOffset += meshOutputGroup.normals.length;
      }
      if (uvFA) {
        uvFA.set(meshOutputGroup.uvs, uvFAOffset);
        uvFAOffset += meshOutputGroup.uvs.length;
      }
      if (this.logging.enabled && this.logging.debug) {
        let materialIndexLine = "";
        if (selectedMaterialIndex) {
          materialIndexLine = "\n		materialIndex: " + selectedMaterialIndex;
        }
        const createdReport = "	Output Object no.: " + this.outputObjectCount + "\n		groupName: " + meshOutputGroup.groupName + "\n		Index: " + meshOutputGroup.index + "\n		faceType: " + this.rawMesh.faceType + "\n		materialName: " + meshOutputGroup.materialName + "\n		smoothingGroup: " + meshOutputGroup.smoothingGroup + materialIndexLine + "\n		objectName: " + meshOutputGroup.objectName + "\n		#vertices: " + meshOutputGroup.vertices.length / 3 + "\n		#indices: " + meshOutputGroup.indices.length + "\n		#colors: " + meshOutputGroup.colors.length / 3 + "\n		#uvs: " + meshOutputGroup.uvs.length / 2 + "\n		#normals: " + meshOutputGroup.normals.length / 3;
        console.debug(createdReport);
      }
    }
    this.outputObjectCount++;
    this.callbacks.onAssetAvailable({
      cmd: "assetAvailable",
      type: "mesh",
      progress: {
        numericalValue: this.globalCounts.currentByte / this.globalCounts.totalBytes
      },
      params: {
        meshName: result.name
      },
      materials: {
        multiMaterial: createMultiMaterial,
        materialNames,
        materialGroups
      },
      buffers: {
        vertices: vertexFA,
        indices: indexUA,
        colors: colorFA,
        normals: normalFA,
        uvs: uvFA
      },
      geometryType: this.rawMesh.faceType < 4 ? 0 : this.rawMesh.faceType === 6 ? 2 : 1
    }, [vertexFA.buffer], indexUA !== null ? [indexUA.buffer] : null, colorFA !== null ? [colorFA.buffer] : null, normalFA !== null ? [normalFA.buffer] : null, uvFA !== null ? [uvFA.buffer] : null);
  },
  _finalizeParsing: function() {
    if (this.logging.enabled)
      console.info("Global output object count: " + this.outputObjectCount);
    if (this._processCompletedMesh() && this.logging.enabled) {
      const parserFinalReport = "Overall counts: \n	Vertices: " + this.globalCounts.vertices + "\n	Faces: " + this.globalCounts.faces + "\n	Multiple definitions: " + this.globalCounts.doubleIndicesCount;
      console.info(parserFinalReport);
    }
  }
};
export {OBJLoader2Parser};
