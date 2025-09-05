import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { basketService } from "../services/basketService";

const HOST = "https:localhost:5173";

const BasketHeader = ({ requestsCount }) => {
  const { id } = useParams();
  return (
    <section>
      <p>Basket: {id}</p>
      <p>Requests are collected at: {`${HOST}/${id}`}</p>
      <p>Requests: {requestsCount}</p>
    </section>
  );
};

const ViewHeaders = ({ headers }) => {
  return (
    <div>
      {Object.entries(headers).map(([header, headerVal], index) => (
        <div key={index}>
          {header}: {headerVal}
        </div>
      ))}
    </div>
  );
};

const DeleteBasketButton = ({ deleteBasket }) => {
  return (
    <div>
      <button onClick={deleteBasket}>Delete entire basket</button>
    </div>
  );
};

const DeleteAllRequestsButton = ({ deleteRequests }) => {
  return (
    <div>
      <button onClick={deleteRequests}>
        Delete all currently tracked requests
      </button>
    </div>
  );
};

const ViewBody = ({ body }) => {
  if (body === null) {
    return;
  } else {
    return <p>Body: {body}</p>;
  }
};

const RequestBasket = ({ allRequests }) => {
  const RequestItem = ({ request, index }) => {
    // converted timestamp string into Date for easy formatting of time/date
    // created ViewHeaders to see all headers in a list rather than array
    return (
      <li key={index}>
        <p>Method: {request.method}</p>
        <p>{request.path}</p>
        <p>Date: {new Date(request.created_at).toLocaleDateString()}</p>
        <p>Time: {new Date(request.created_at).toLocaleTimeString()}</p>
        <ViewHeaders headers={request.headers} />
        <ViewBody body={request.raw_body} />
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
  // moved allRequests to BasketPage in order to pass state of basket to
  // other components
  const { id } = useParams();
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const basket = await basketService.getBasket(id);
        if (basket) setAllRequests(basket);
      } catch {
        navigate("/web", { replace: true });
      }
    })();
  }, [id, navigate]);

  const handleDeleteRequest = async () => {
    try {
      const res = await basketService.emptyBasket(id);

      if (res) setAllRequests([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteBasket = async () => {
    try {
      const res = await basketService.deleteBasket(id);
      if (res) navigate("/web", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <BasketHeader requestsCount={allRequests.length} />
      <DeleteAllRequestsButton deleteRequests={handleDeleteRequest} />
      <DeleteBasketButton deleteBasket={handleDeleteBasket} />
      <Link to="/web">Click here to return to all baskets</Link>
      <RequestBasket allRequests={allRequests} />
    </div>
  );
};

export default BasketPage;
