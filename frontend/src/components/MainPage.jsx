import { Link } from "react-router-dom";
const DUMMY_BASKETS = [
  { id: "abc123", name: "this is basket abc123" },
  { id: "xyz890", name: "this is basket xyz890" },
];

const MainPage = () => {
  // modified mainPage component to test out dummy data and also ensure
  // individual baskets can be accessed
  return (
    <>
      <p>This is the main components</p>
      <p>links section: </p>
      {DUMMY_BASKETS.map((basket) => (
        <ul key={basket.id}>
          <li>
            <Link key={basket.id} to={`/web/${basket.id}`}>
              {basket.name}
            </Link>
          </li>
        </ul>
      ))}
      <Link></Link>
    </>
  );
};

export default MainPage;
