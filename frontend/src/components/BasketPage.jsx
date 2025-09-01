import { Link, useParams } from "react-router-dom";

const BasketPage = () => {
  const { id } = useParams();

  return (
    <div>
      <p>This is the basket component with id {id}</p>
      <Link to="/web">Click here to return to all baskets</Link>
    </div>
  );
};

export default BasketPage;
