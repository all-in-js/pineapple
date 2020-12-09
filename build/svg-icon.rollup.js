import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.jsx',
  output: {
    file: 'dist/svg-icon.common.js',
    format: 'cjs'
  },
  external: ['vue'],
  plugins: [
    resolve({ extensions: ['.vue', '.jsx'] }),
    commonjs(),
    vue(),
    babel()
  ]
}