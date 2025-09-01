import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

const DUMMY_BASKETS = [
  { id: "abc123", name: "this is basket abc123" },
  { id: "xyz890", name: "this is basket xyz890" },
];

const BasketList = () => {
  const [basketNames, setBasketNames] = useState([]);

  useEffect(() => {
    (async () => {
      // TODO: uncomment after basketService implementation
      // const allNames = basketService.all();
      const allNames = DUMMY_BASKETS;
      setBasketNames(allNames);
    })();
  }, []);

  const basketListItem = ({ id, name }) => {
    return (
      <li key={id}>
        <Link to={`${URL_PREFIX}/${id}`}>{name}</Link>
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
