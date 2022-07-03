const fs = require("fs");
const path = require('path');
const express = require("express");
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const rollup = require("rollup");
const ts = require('rollup-plugin-typescript2');
const { terser } = require("rollup-plugin-terser");

const extensions = [
  '.js',
  '.ts',
];

// --- TS ---
const getPath = _path => path.resolve(__dirname, _path)
const tsPlugin = ts({
  // - 导入本地ts配置 -
  tsconfig: getPath('./tsconfig.json'),
  extensions,
});

const watchOption = {
  input: './src/index.ts',
  output: {
    file: './lib/eagle-eye.js',
    format: 'umd',
    name: "eagleEye",
  },
  plugins: [
    resolve(extensions),
    tsPlugin,
    babel({
      exclude: 'node_modules/**'
    }),
    terser(),
    // uglify(),
  ],
  watch: {
    chokidar: true,
    include: 'src/**',
    exclude: "node_modules/**"
  }
};

const watcher = rollup.watch(watchOption);

watcher.on('event', event => {
  switch (event.code) {
    case 'START':
      console.log('Rebuilding...');
      break;
    case 'BUNDLE_START':
      console.log('Bundling...');
      break;
    case 'BUNDLE_END':
      console.log('Bundled!');
      break;
    case 'END':
      console.log('Done!');
      break;
    case 'ERROR':
    case 'FATAL':
      console.error("Rollup error: ", event);
  }
});

process.on('exit', () => {
  // 停止监听
  watcher.close();
});

const app = express();
app.use(express.static('./'))

// 设置允许跨域访问该服务
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use("/report", (req, res) => {
  res.send({
    code: 200,
    result: 'success',
    msg: 'success',
    // serverOpenRecord: true,
  })
});

app.use("/slow", (req, res) => {
  setTimeout(() => {
    res.send({
      code: 200,
      result: 'success',
      msg: 'success',
    })
  }, 700)
});


const point = 3002;
console.log("+++++++++", "http://localhost:3002")
app.listen(point);
