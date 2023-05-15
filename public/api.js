const BASE_SERVER = "http://localhost:3000";

export const getApi = async (url) => {
  let response = await axios.get(`${BASE_SERVER}${url}`);
  console.log(response);
};

export const postApi = async (data, url) => {
  let response = await axios.post(`${BASE_SERVER}${url}`, data);
  console.log(response);
};
