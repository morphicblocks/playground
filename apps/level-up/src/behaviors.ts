import type { MorphicBehaviorMap, MorphicBehaviorProxy } from "morphic-blocks";

// Each block as JavaScript that does what its Python does, so Run prints what
// Python would print. Python values map to JavaScript like this:
//   int and bool: plain numbers and booleans
//   float: a boxed Number (Object(2.5)), so 10 / 2 still prints as 5.0
//   None: null
// Errors carry Python's name (NameError, TypeError, ...) in their message.

// The helpers below are pasted into the generated code by their source text
// (`${pyStr}` is the function's source), so a program depends on nothing from
// the page. That is why each one is self contained and repeats small pieces.

/** How print() shows a value. */
function pyStr(v: unknown): string {
  if (v === true) return "True";
  if (v === false) return "False";
  if (v === null || v === undefined) return "None";
  if (v instanceof Number) {
    const n = v.valueOf();
    return Number.isInteger(n) ? n.toFixed(1) : String(n);
  }
  if (typeof v === "function") return "<function>";
  return String(v);
}

/** Python's truth test: 0, 0.0, "" and None are false. */
function pyTruth(v: unknown): boolean {
  return !!(v instanceof Number ? v.valueOf() : v);
}

/** + - * / with Python's rules for int, float, bool and str. */
function pyMath(op: string, a: unknown, b: unknown): unknown {
  const type = (v: unknown) =>
    v instanceof Number ? "float" : typeof v === "number" ? "int" : typeof v === "boolean" ? "bool"
      : typeof v === "string" ? "str" : v === null ? "NoneType" : "function";
  const num = (v: unknown) => (v instanceof Number ? v.valueOf() : typeof v === "boolean" ? Number(v) : v);
  const x = num(a);
  const y = num(b);
  const isInt = (v: unknown) => typeof v === "number" || typeof v === "boolean";
  if (op === "+" && typeof x === "string" && typeof y === "string") return x + y;
  if (op === "+" && typeof x === "string") throw new Error(`TypeError: can only concatenate str (not "${type(b)}") to str`);
  if (op === "*" && typeof x === "string" && isInt(b)) return x.repeat(Math.max(0, y as number));
  if (op === "*" && typeof y === "string" && isInt(a)) return y.repeat(Math.max(0, x as number));
  if (typeof x !== "number" || typeof y !== "number") {
    throw new Error(`TypeError: unsupported operand type(s) for ${op}: '${type(a)}' and '${type(b)}'`);
  }
  if (op === "/" && y === 0) throw new Error("ZeroDivisionError: division by zero");
  const result = op === "+" ? x + y : op === "-" ? x - y : op === "*" ? x * y : x / y;
  return op === "/" || a instanceof Number || b instanceof Number ? Object(result) : result;
}

/** == != < > <= >= without JavaScript's type juggling. */
function pyCompare(op: string, a: unknown, b: unknown): boolean {
  const num = (v: unknown) => (v instanceof Number ? v.valueOf() : typeof v === "boolean" ? Number(v) : v);
  const x = num(a);
  const y = num(b);
  if (op === "==") return x === y;
  if (op === "!=") return x !== y;
  if (typeof x !== typeof y || (typeof x !== "number" && typeof x !== "string")) {
    const type = (v: unknown) =>
      v instanceof Number ? "float" : typeof v === "number" ? "int" : typeof v === "boolean" ? "bool"
        : typeof v === "string" ? "str" : v === null ? "NoneType" : "function";
    throw new Error(`TypeError: '${op}' not supported between instances of '${type(a)}' and '${type(b)}'`);
  }
  const [p, q] = [x as number, y as number];
  return op === "<" ? p < q : op === ">" ? p > q : op === "<=" ? p <= q : p >= q;
}

/** `and` / `or` return one of their operands, and skip the second when they can. */
function pyLogic(op: string, a: unknown, b: () => unknown): unknown {
  const truth = !!(a instanceof Number ? a.valueOf() : a);
  return op === "and" ? (truth ? b() : a) : truth ? a : b();
}

/** range() only takes whole numbers. */
function pyRange(v: unknown): number {
  if (typeof v === "number" || typeof v === "boolean") return Number(v);
  const type = v instanceof Number ? "float" : typeof v === "string" ? "str" : v === null ? "NoneType" : "function";
  throw new Error(`TypeError: '${type}' object cannot be interpreted as an integer`);
}

/** Reading a name that was never given a value is a NameError. */
function pyNameError(name: string): never {
  throw new Error(`NameError: name '${name}' is not defined`);
}

/** Calling something that is not a function. */
function pyCallable(f: unknown, name: string): (...args: unknown[]) => unknown {
  if (typeof f === "function") return f as (...args: unknown[]) => unknown;
  if (f === undefined) throw new Error(`NameError: name '${name}' is not defined`);
  throw new Error(`TypeError: '${name}' is not callable`);
}

// A very long loop would freeze the page, so every loop counts its rounds and
// gives up after this many, saying so in the output.
const MAX_ROUNDS = 1000;
const guard = (counter: string) =>
  `  if (${counter} >= ${MAX_ROUNDS}) throw new Error("stopped after ${MAX_ROUNDS} rounds, the loop may never end");\n`;

// Python names live in their own `$` space, so a variable called `console`
// or `new` can never clash with JavaScript. `var` gives Python's scoping: a
// name set inside a function stays local to it.
const id = (name: string) => `$${name.trim().replace(/\W/g, "_") || "_"}`;
const read = (name: string) => `(typeof ${id(name)} === "undefined" ? (${pyNameError})(${JSON.stringify(name)}) : ${id(name)})`;

// Helper names made unique per block, so nested loops never share them.
const own = (proxy: MorphicBehaviorProxy, name: string) => `__${name}_${proxy.blockId.replace(/\W/g, "_")}`;

// Python refuses to run a program with an empty slot or an empty body, so
// these throw while the code is being generated, before anything is printed.
const need = (proxy: MorphicBehaviorProxy, input: string, what: string) => {
  const code = proxy.inputs[input];
  if (!code) throw new Error(`SyntaxError: ${what} has an empty slot`);
  return code;
};
const body = (proxy: MorphicBehaviorProxy, input: string, after: string) => {
  const code = proxy.inputs[input];
  if (!code) throw new Error(`IndentationError: expected an indented block after ${after}`);
  return code;
};

export const behaviors: MorphicBehaviorMap = {
  print: (proxy) => `console.log(${proxy.inputs.VALUE ? `(${pyStr})(${proxy.inputs.VALUE})` : '""'});\n`,

  text: (proxy) => proxy.quoted.TEXT ?? '""',

  // A number with a decimal point is a float in Python.
  number: (proxy) => {
    const n = Number(proxy.fields.NUM || 0);
    return Number.isInteger(n) ? String(n) : `Object(${n})`;
  },

  set: (proxy) => `var ${id(proxy.fields.NAME)} = ${need(proxy, "VALUE", "=")};\n`,

  get: (proxy) => read(proxy.fields.NAME),

  math: (proxy) =>
    `(${pyMath})(${JSON.stringify(proxy.fields.OP)}, ${need(proxy, "A", proxy.fields.OP)}, ${need(proxy, "B", proxy.fields.OP)})`,

  add: (proxy) =>
    `var ${id(proxy.fields.NAME)} = (${pyMath})("+", ${read(proxy.fields.NAME)}, ${need(proxy, "VALUE", "+=")});\n`,

  if: (proxy) =>
    `if ((${pyTruth})(${need(proxy, "CONDITION", "if")})) {\n${body(proxy, "DO", "'if' statement")}}\n`,

  if_else: (proxy) =>
    `if ((${pyTruth})(${need(proxy, "CONDITION", "if")})) {\n${body(proxy, "DO", "'if' statement")}} else {\n` +
    `${body(proxy, "ELSE", "'else' statement")}}\n`,

  compare: (proxy) =>
    `(${pyCompare})(${JSON.stringify(proxy.fields.OP)}, ${need(proxy, "A", proxy.fields.OP)}, ${need(proxy, "B", proxy.fields.OP)})`,

  logic: (proxy) =>
    `(${pyLogic})(${JSON.stringify(proxy.fields.OP)}, ${need(proxy, "A", proxy.fields.OP)}, () => ${need(proxy, "B", proxy.fields.OP)})`,


  bool: (proxy) => (proxy.fields.VALUE === "False" ? "false" : "true"),

  // for i in range(n): n is worked out once, before the first round, i runs
  // from 0 to n minus 1 and keeps its last value after the loop.
  for: (proxy) => {
    const end = own(proxy, "end");
    const round = own(proxy, "round");
    return (
      `for (var ${end} = (${pyRange})(${need(proxy, "TIMES", "range()")}), ${round} = 0; ${round} < ${end}; ${round}++) {\n` +
      guard(round) +
      `  var ${id(proxy.fields.VAR)} = ${round};\n${body(proxy, "DO", "'for' statement")}}\n`
    );
  },

  while: (proxy) => {
    const round = own(proxy, "round");
    return (
      `for (var ${round} = 0; (${pyTruth})(${need(proxy, "CONDITION", "while")}); ${round}++) {\n` +
      guard(round) +
      `${body(proxy, "DO", "'while' statement")}}\n`
    );
  },

  break: () => "break;\n",

  // A function is a value stored under its name when the def runs, so calling
  // it before the def is a NameError, as in Python. It checks its argument
  // count because JavaScript would silently accept any number.
  def: (proxy) => {
    const name = proxy.fields.NAME.trim();
    const param = proxy.fields.PARAM.trim();
    const check = param
      ? `  if (arguments.length !== 1) throw new Error(${JSON.stringify(`TypeError: ${name}() missing 1 required positional argument: '${param}'`)});\n`
      : `  if (arguments.length !== 0) throw new Error(${JSON.stringify(`TypeError: ${name}() takes 0 positional arguments but 1 was given`)});\n`;
    return (
      `var ${id(name)} = function (${param ? id(param) : ""}) {\n${check}` +
      `${body(proxy, "BODY", `function definition on '${name}'`)}  return null;\n};\n`
    );
  },

  call: (proxy) =>
    `(${pyCallable})(typeof ${id(proxy.fields.NAME)} === "undefined" ? undefined : ${id(proxy.fields.NAME)}, ${JSON.stringify(proxy.fields.NAME)})(${proxy.inputs.ARG || ""});\n`,


  return: (proxy) => `return ${proxy.inputs.VALUE || "null"};\n`,
};
