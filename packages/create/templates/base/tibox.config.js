import { defineConfig, loadEnv } from "@tibox/tibox-cli";

export default defineConfig(async ({ product, mode, command }) => {
  const { TIBOX_APPID } = loadEnv(product, mode, process.cwd());
  const ext = await import(`./exts/${product}.${mode}.js`);

  return {
    project: "demo",
    product: "default",
    mode: "development",
    // sourceDir: 'src',
    // destDir: 'dist',
    appid: TIBOX_APPID,
    ext: ext.default,
    dev: {},
    build: {},
    upload: {
      robot: 2,
    },
    envDir: "./",
    plugins: [
      // {
      //   name: '',
      //   transform: (code) => {
      //     if (code.indexOf('wx.request') > -1) {
      //       console.log(code)
      //     }
      //     return code
      //   },
      // },
    ],
  };
});
