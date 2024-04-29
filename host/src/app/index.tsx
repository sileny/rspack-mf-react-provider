import { Hello } from "provider/Hello";

export default function () {
  return (
    <div className="App">
      <Hello origin="host" />
    </div>
  );
}
