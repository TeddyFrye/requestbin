import { useEffect, useState } from "react";

import basketService from "../services/basketService";

// TODO: extract this to a project wide file (alongside App.jsx)
const URL_PREFIX = "/web";

const CREATE_TITLE = "Create New Basket";
const CREATE_DESCRIPTION =
  "Generate an endpoint and inspect the HTTP requests it receives.";
const CREATE_BUTTON = "Create";
const LIST_TITLE = "Existing Baskets";

const ButtonSection = () => {
  return (
    <section>
      <h1>{CREATE_TITLE}</h1>
      <p>{CREATE_DESCRIPTION}</p>
      <button type="button">{CREATE_BUTTON}</button>
    </section>
  );
};

const BasketList = () => {
  const [basketNames, setBasketNames] = useState([]);

  useEffect(() => {
    (async () => {
      // TODO: uncomment after basketService implementation
      // const allNames = basketService.all();
      const allNames = ["abc", "123"];
      setBasketNames(allNames);
    })();
  }, []);

  const basketListItem = (basketName) => {
    // TODO: incorporate react router
    return (
      <li key={basketName}>
        <a href={`${URL_PREFIX}/${basketName}`}>{basketName}</a>
      </li>
    );
  };

  return (
    <section>
      <h1>{LIST_TITLE}</h1>
      <ul>{basketNames.map(basketListItem)}</ul>
    </section>
  );
};

const MainPage = () => {
  return (
    <>
      <ButtonSection />
      <BasketList />
    </>
  );
};

export default MainPage;
