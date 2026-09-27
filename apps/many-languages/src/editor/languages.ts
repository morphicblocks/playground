// The page around the blocks speaks the chosen language too. The blocks and
// the pseudocode get their words from definitions.json; these are the words
// of the page itself.

export type LanguageCode = "en" | "de" | "es" | "el" | "zh" | "ar";

export interface Language {
  code: LanguageCode;
  /** The preset in definitions.json that shows this language. */
  preset: string;
  /** The language's own name, in its own script. */
  name: string;
  /** Right to left: flips the blocks, the toolbox tiles and the text, not the page layout. */
  rtl: boolean;
  /** The language's line color on the map, and the text color on top of it. */
  line: string;
  lineInk: string;
  /** A lighter shade of the line color, for text on the dark tabs. */
  lineText: string;
  hello: string;
  intro: string;
  toolbox: string;
  blocks: string;
  pseudocode: string;
  output: string;
  run: string;
  nothing: string;
  error: string;
}

export const languages: Language[] = [
  {
    code: "en", preset: "english", name: "English", rtl: false, line: "#3b82d6", lineInk: "#1e1e1e", lineText: "#569cd6", hello: "Hello",
    intro: "The same blocks in six languages. Pick one:\nblocks, toolbox and pseudocode change, the program stays.",
    toolbox: "Blocks to drag", blocks: "Program", pseudocode: "Pseudocode", output: "Output",
    run: "Run", nothing: "Press Run to see what the program prints.", error: "Error",
  },
  {
    code: "de", preset: "german", name: "Deutsch", rtl: false, line: "#d4b72c", lineInk: "#1e1e1e", lineText: "#dcdcaa", hello: "Hallo",
    intro: "Dieselben Blöcke in sechs Sprachen. Wähle eine:\nBlöcke, Werkzeugkasten und Pseudocode wechseln, das Programm bleibt.",
    toolbox: "Blöcke zum Ziehen", blocks: "Programm", pseudocode: "Pseudocode", output: "Ausgabe",
    run: "Ausführen", nothing: "Drücke Ausführen, um zu sehen, was das Programm ausgibt.", error: "Fehler",
  },
  {
    code: "es", preset: "spanish", name: "Español", rtl: false, line: "#e07b4f", lineInk: "#1e1e1e", lineText: "#ce9178", hello: "Hola",
    intro: "Los mismos bloques en seis idiomas. Elige uno:\ncambian los bloques, la caja de herramientas y el pseudocódigo, el programa se queda.",
    toolbox: "Bloques para arrastrar", blocks: "Programa", pseudocode: "Pseudocódigo", output: "Salida",
    run: "Ejecutar", nothing: "Pulsa Ejecutar para ver lo que muestra el programa.", error: "Error",
  },
  {
    code: "el", preset: "greek", name: "Ελληνικά", rtl: false, line: "#3fa9e0", lineInk: "#1e1e1e", lineText: "#9cdcfe", hello: "Γεια σου",
    intro: "Τα ίδια μπλοκ σε έξι γλώσσες. Διάλεξε μία:\nαλλάζουν τα μπλοκ, η εργαλειοθήκη και ο ψευδοκώδικας, το πρόγραμμα παραμένει το ίδιο.",
    toolbox: "Μπλοκ για σύρσιμο", blocks: "Πρόγραμμα", pseudocode: "Ψευδοκώδικας", output: "Έξοδος",
    run: "Εκτέλεση", nothing: "Πάτησε Εκτέλεση για να δεις τι εμφανίζει το πρόγραμμα.", error: "Σφάλμα",
  },
  {
    code: "zh", preset: "chinese", name: "中文", rtl: false, line: "#7fb35a", lineInk: "#1e1e1e", lineText: "#b5cea8", hello: "你好",
    intro: "同样的积木，六种语言。选一种：\n积木、工具箱和伪代码都会改变，程序保持不变。",
    toolbox: "可拖拽积木", blocks: "程序", pseudocode: "伪代码", output: "输出",
    run: "运行", nothing: "点击运行，看看程序输出什么。", error: "错误",
  },
  {
    code: "ar", preset: "arabic", name: "العربية", rtl: true, line: "#c257b8", lineInk: "#1e1e1e", lineText: "#c586c0", hello: "مرحبا",
    intro: "الكتل نفسها بست لغات. اختر لغة:\nتتغير الكتل وصندوق الأدوات والشيفرة الزائفة، ويبقى البرنامج كما هو.",
    toolbox: "كتل للسحب", blocks: "البرنامج", pseudocode: "الشيفرة الزائفة", output: "المخرجات",
    run: "تشغيل", nothing: "اضغط تشغيل لترى ما يطبعه البرنامج.", error: "خطأ",
  },
];

export const byCode = (code: string | undefined) => languages.find((language) => language.code === code);
