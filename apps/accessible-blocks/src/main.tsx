import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/opendyslexic/700.css";
import "./style.css";
import { render } from "preact";
import { App } from "./App";

render(<App />, document.getElementById("app")!);
