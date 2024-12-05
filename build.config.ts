import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  rollup: {
    esbuild: {
      jsx: "automatic",
    },
  },
});
