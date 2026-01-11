import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: true,
  exports: true,
  entry: 'src/index.ts',
  outDir: 'dist',
  clean: true,
  platform: 'node',
  format: ['esm', 'cjs'],
  treeshake: true,
  external: [],
  target: ['es2022'],
  banner: {
    js: '/* @glitchproof/form-field-generator */',
  },
});
