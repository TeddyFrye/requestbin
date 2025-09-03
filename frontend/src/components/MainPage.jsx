import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { basketService } from "../services/basketService";

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
      const allNames = await basketService.all();
      setBasketNames(allNames);
    })();
  }, []);

  const basketListItem = (name) => {
    return (
      <li key={name}>
        <Link to={`${URL_PREFIX}/${name}`}>{name}</Link>
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
