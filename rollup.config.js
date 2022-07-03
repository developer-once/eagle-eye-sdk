import path from 'path';
import rollup from 'rollup';
import resolve from 'rollup-plugin-node-resolve'
import ts from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
// import { uglify } from 'rollup-plugin-uglify';
import { terser } from "rollup-plugin-terser";

const getPath = _path => path.resolve(__dirname, _path)
const extensions = [
  '.js',
  '.ts',
];

// --- TS ---
const tsPlugin = ts({
  // - 导入本地ts配置 -
  tsconfig: getPath('./tsconfig.json'),
  extensions,
});

const watchOption = {
  input: './src/index.ts',
  output: [
    {
      file: './lib/eagle-eye.js',
      // ---- npm ----
      // format: 'amd',
      // ---- sdk ----
      format: 'umd',
      name: "eagleEye",
    }
  ],
  plugins:[
    resolve(extensions),
    tsPlugin,
    babel({
      exclude: 'node_modules/**'
    }),
    terser(),
    // uglify(),
  ]
};
export default watchOption;