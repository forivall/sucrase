import {createCheckers} from "ts-interface-checker";

import OptionsGenTypes from "./Options-gen-types";

const {Options: OptionsChecker} = createCheckers(OptionsGenTypes);

export type Transform = "jsx" | "typescript" | "flow" | "imports" | "react-hot-loader" | "jest";

export interface SourceMapOptions {
  /**
   * The name to use in the "file" field of the source map. This should be the name of the compiled
   * file.
   */
  compiledFilename: string;
}

export interface Options {
  /**
   * Unordered array of transform names describing both the allowed syntax
   * (where applicable) and the transformation behavior.
   */
  transforms: Array<Transform>;
  /**
   * Opts out of all ES syntax transformations: optional chaining, nullish
   * coalescing, class fields, numeric separators, optional catch binding.
   */
  disableESTransforms?: boolean;
  /**
   * Transformation mode for the JSX transform. The automatic transform refers
   * to the transform behavior released with React 17, where the `jsx` function
   * (or a variation) is automatically imported. The classic transform refers to
   * the previous behavior using `React.createElement`.
   *
   * Default value: "classic"
   */
  jsxRuntime?: "classic" | "automatic";
  /**
   * Compile code for production use. Currently only applies to the JSX
   * transform.
   */
  production?: boolean;
  /**
   * If specified, import path prefix to use in place of "react" when compiling
   * JSX with the automatic runtime.
   */
  jsxImportSource?: string;
  /**
   * If specified, function name to use in place of React.createClass when
   * compiling JSX with the classic runtime.
   */
  jsxPragma?: string;
  /**
   * If specified, function name to use in place of React.Fragment when
   * compiling JSX with the classic runtime.
   */
  jsxFragmentPragma?: string;
  /**
   * If specified, the imports transform does not attempt to change dynamic
   * import() expressions into require() calls.
   */
  preserveDynamicImport?: boolean;
  /**
   * Only relevant when targeting ESM (i.e. when the imports transform is *not*
   * specified). This flag changes the behavior of TS require imports:
   *
   * import Foo = require("foo");
   *
   * to import createRequire, create a require function, and use that function.
   * This is the TS behavior with module: nodenext and makes it easier for the
   * same code to target ESM and CJS.
   */
  injectCreateRequireForImportRequire?: boolean;
  /**
   * If true, replicate the import behavior of TypeScript's esModuleInterop: false.
   */
  enableLegacyTypeScriptModuleInterop?: boolean;
  /**
   * If true, replicate the import behavior Babel 5 and babel-plugin-add-module-exports.
   */
  enableLegacyBabel5ModuleInterop?: boolean;
  /**
   * If specified, we also return a RawSourceMap object alongside the code.
   * Currently, source maps simply map each line to the original line without
   * any mappings within lines, since Sucrase preserves line numbers. filePath
   * must be specified if this option is enabled.
   */
  sourceMapOptions?: SourceMapOptions;
  /**
   * File path to use in error messages, React display names, and source maps.
   */
  filePath?: string;
}

export function validateOptions(options: Options): void {
  OptionsChecker.strictCheck(options);
}
