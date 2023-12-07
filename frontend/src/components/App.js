import React from "react";
import { createRoot } from "react-dom/client";

import HomePage from "./Pages/HomePage";

const App = (props) => {
  return (
    <div className="center">
      <HomePage />
    </div>
  );
};

export default App;

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
