import * as ThreeModule from 'three';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { MeshoptDecoder } from './three-r185.1-package/examples/jsm/libs/meshopt_decoder.module.js';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { MaskPass, ClearMaskPass } from './postprocessing/MaskPass.js';
import { ShaderPass } from './postprocessing/ShaderPass.js';
import { RenderPass } from './postprocessing/RenderPass.js';
import { UnrealBloomPass } from './postprocessing/UnrealBloomPass.js';
import { OutputPass } from './postprocessing/OutputPass.js';
import { CopyShader } from './shaders/CopyShader.js';
import { LuminosityHighPassShader } from './shaders/LuminosityHighPassShader.js';
import { FXAAShader } from './shaders/FXAAShader.js';
import { OutputShader } from './shaders/OutputShader.js';

// r161+ no longer ships the old mutable UMD `THREE` namespace or classic
// addon scripts. The game remains an ordered, no-bundler IIFE application, so
// expose one compatibility namespace made entirely from the exact r185.1 ESM
// dependency graph. All constructors still come from the same core module.
const THREE = Object.assign(Object.create(null), ThreeModule, {
  GLTFLoader,
  MeshoptDecoder,
  EffectComposer,
  MaskPass,
  ClearMaskPass,
  ShaderPass,
  RenderPass,
  UnrealBloomPass,
  OutputPass,
  CopyShader,
  LuminosityHighPassShader,
  FXAAShader,
  OutputShader
});

THREE.ColorManagement.enabled = true;

Object.defineProperty(window, 'THREE', {
  configurable: true,
  enumerable: true,
  writable: false,
  value: THREE
});

Object.defineProperty(window, '__elementalThreeMigration', {
  configurable: true,
  enumerable: false,
  writable: false,
  value: Object.freeze({
    revision: THREE.REVISION,
    packageVersion: '0.185.1',
    colorManagement: THREE.ColorManagement.enabled,
    addons: Object.freeze([
      'GLTFLoader', 'MeshoptDecoder', 'EffectComposer', 'MaskPass', 'ClearMaskPass',
      'ShaderPass', 'RenderPass', 'UnrealBloomPass', 'OutputPass'
    ])
  })
});

window.dispatchEvent(new CustomEvent('elemental:three-ready', {
  detail: window.__elementalThreeMigration
}));

export { THREE };
