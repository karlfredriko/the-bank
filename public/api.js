const BASE_SERVER = "http://localhost:3000";

export const getApi = async (url) => {
  let response = await axios.get(`${BASE_SERVER}${url}`);
  return response.data;
};

export const postApi = async (url, data) => {
  let response = await axios.post(`${BASE_SERVER}${url}`, data);
  return response.data;
};
