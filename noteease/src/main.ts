import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NoteEaseContainer } from "./NoteEaseContainer";

// Render the main NoteEaseContainer app
const appDiv = document.querySelector<HTMLDivElement>("#app");
if (appDiv) {
  createRoot(appDiv).render(
    <StrictMode>
      <NoteEaseContainer />
    </StrictMode>
  );
}
