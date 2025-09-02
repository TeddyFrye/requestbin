import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const HOST = "https:localhost:5173";
const DUMMY_REQUESTS = [
  {
    id: "abc123",
    name: "this is basket abc123",
    requests: [
      {
        method: "post",
        timestamp: "mon sept 1st 7:30pm",
        headers: {
          "Content-Type": "json/application",
        },
      },
      {
        method: "get",
        timestamp: "tues sept 2nd 4:30am",
        headers: {
          "Content-Type": "json/application",
        },
      },
    ],
  },
  {
    id: "xyz890",
    name: "this is basket xyz890",
    requests: [
      {
        method: "POST",
        timestamp: "MONDAY sept 1st 7:30pm",
        headers: {
          "Content-Type": "json/application",
        },
      },
      {
        method: "GET",
        timestamp: "TUESDAY sept 2nd 4:30am",
        headers: {
          "Content-Type": "json/application",
        },
      },
    ],
  },
];

const BasketHeader = () => {
  const { id } = useParams();
  // would have to refactor requests to pull data from fetch
  // and then display the amount of requests for the current basket
  return (
    <section>
      <p>Basket: {id}</p>
      <p>Requests are collected at: {`${HOST}/${id}`}</p>
      <p>Requests: {DUMMY_REQUESTS.length}</p>
    </section>
  );
};

const RequestBasket = () => {
  const { id } = useParams();
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    (async () => {
      // fetch data for all requests stored in database
      // basketService.getBasket(id)
      const basket = DUMMY_REQUESTS.find((b) => b.id === id);
      if (basket) setAllRequests(basket.requests);
    })();
  }, [id]);

  const RequestItem = ({ request, index }) => {
    // can refactor Time with TIMESTAMP value from db
    // and split method to show either time or date
    return (
      <li key={index}>
        <p>Method: {request.method}</p>
        <p>Time: {request.timestamp}</p>
        <p>Headers: {JSON.stringify(request.headers)}</p>
      </li>
    );
  };

  return (
    <section>
      <ul>
        {allRequests.map((request, idx) => (
          <RequestItem key={idx} request={request} index={idx} />
        ))}
      </ul>
    </section>
  );
};

const BasketPage = () => {
  return (
    <div>
      <BasketHeader />
      <RequestBasket />
      <Link to="/web">Click here to return to all baskets</Link>
    </div>
  );
};

export default BasketPage;
