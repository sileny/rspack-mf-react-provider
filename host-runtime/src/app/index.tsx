import { lazy, Suspense } from "react";
import { loadRemote } from "@module-federation/runtime";
// @ts-ignore
const Hello = lazy(() => loadRemote("pro/Hello").then((module) => ({ default: module.Hello })));

export default function () {
  return (
    <div className="App">
      <Suspense fallback="Loading Hello">
        <Hello origin="host-runtime" />
      </Suspense>
    </div>
  );
}
