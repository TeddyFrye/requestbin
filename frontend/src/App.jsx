import { useState } from "react";
import basketService from "./services/basketService";
import MainPage from "./components/MainPage";
import BasketPage from "./components/BasketPage";

function App() {
  return (
    <>
      <MainPage />
      <BasketPage />
    </>
  );
}

export default App;
