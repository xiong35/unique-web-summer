// simulate jQuery
function $(query, all = false) {
  if (all) {
    return document.querySelectorAll(query);
  }
  return document.querySelector(query);
}

// axios
const instance = axios.create({
  baseURL: "http://127.0.0.1:7777/rstar/",
  timeout: 5000,
});
instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    data.data = JSON.parse(data.data);
    return data;
  },
  (err) => {
    throw err;
  }
);
function getPosts(page) {
  return instance({
    url: `posts?page=${page || 1}`,
  });
}
function getGames(page) {
  return instance({
    url: "games",
  });
}
