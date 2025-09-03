const API_HOST = "http://localhost:3001";
const API = `${API_HOST}/api`;

// TODO: more graceful error handling?
// perhaps that should be left up to individual components
// but we may want some retries here or something
// currently all errors are re thrown

export class BasketNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "BasketNotFoundError";
  }
}

const all = async () => {
  try {
    const response = await fetch(`${API}/baskets`);
    const basketNames = await response.json();
    return basketNames;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getBasket = async (basketName) => {
  try {
    const response = await fetch(`${API}/baskets/${basketName}`);
    if (response.status === 404) {
      throw new BasketNotFoundError(`No basket exists with name ${basketName}`);
    }
    const requests = await response.json();
    return requests;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const newBasket = async () => {
  try {
    const response = await fetch(`${API}/baskets`, {
      method: "post",
    });
    const { name } = await response.json();
    if (typeof name !== "string") {
      throw Error(`Error generating new basket: response not understood`);
    }
    return name;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const emptyBasket = async (basketName) => {
  try {
    const response = await fetch(`${API}/baskets/${basketName}/requests`, {
      method: "delete",
    });
    // TODO: do we need this check? should we throw an error if it fails?
    return response.status === 204; // 204 No Content
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteBasket = async (basketName) => {
  try {
    const response = await fetch(`${API}/baskets/${basketName}`, {
      method: "delete",
    });
    // TODO: do we need this check? should we throw an error if it fails?
    return response.status === 204; // 204 No Content
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const basketService = {
  all,
  getBasket,
  newBasket,
  emptyBasket,
  deleteBasket,
};
