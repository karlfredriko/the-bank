const BASE_SERVER = "http://localhost:3000";

export const getApi = async (url) => {
  try {
    const response = await axios.get(`${BASE_SERVER}${url}`);
    return response.data;
  } catch (err) {
    console.error("Error occurred in 'getApi'", err.response);
  }
};

export const postApi = async (url, data) => {
  try {
    const response = await axios.post(`${BASE_SERVER}${url}`, data);
    return response.data;
  } catch (err) {
    console.error("Error occurred in 'postApi'", err.response);
  }
};

export const putApi = async (url, data) => {
  try {
    const response = await axios.put(`${BASE_SERVER}${url}`, data);
    return response.data;
  } catch (err) {
    console.error("Error occurred in 'putApi'", err.response);
  }
};
