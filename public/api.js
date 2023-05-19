const BASE_SERVER = "http://localhost:3000";

export const getApi = async (url) => {
  const response = await axios.get(`${BASE_SERVER}${url}`);
  return response.data;
};

export const postApi = async (url, data) => {
  const response = await axios.post(`${BASE_SERVER}${url}`, data);
  return response.data;
};

export const putApi = async (url, data) => {
  const response = await axios.put(`${BASE_SERVER}${url}`, data);
  return response.data;
};
