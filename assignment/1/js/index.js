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

getPosts().then((posts) => {
  console.log(posts);
});

getGames().then((Games) => {
  console.log(Games);
});

// handler for carousel
(function () {
  const carouselDots = $(".carousel-dots button", true);
  const carouseInfo = [
    "Grand Theft Auto V: PlayStation 5 Announcement Trailer",
    "Red Dead Online: Moonshiners",
    "Grand Theft Auto Online: The Diamond Casino Heist",
  ];
  carouselDots.forEach((btn, ind) => {
    btn.onclick = () => {
      $(".carousel-footer-link span").innerHTML =
        carouseInfo[ind];

      const carouselScroller = $(".carousel-scroller");

      $(".carousel-footer-link").href =
        carouselScroller.children[ind].href;

      carouselScroller.children[ind].classList.add("activated");

      carouselDots.forEach((btn) => {
        btn.classList.remove("carousel-dot-active");
      });
      carouselDots[ind].classList.add("carousel-dot-active");

      carouselScroller.style.marginLeft = -ind * 100 + "%";
    };
  });
  carouselDots[0].click();
})();

// render posts
// lazy loading
(function () {
  const imgs = $(".card-container img.lazy", true);
  console.log(imgs);

  function lazyLoad(imgs) {
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    imgs.forEach((it) => {
      if (!it.classList.contains("lazy")) {
        return;
      }
      if (it.offsetTop - scrollTop - clientHeight < 0) {
        it.src = it.dataset.src;
        it.classList.remove("lazy");
      }
    });
  }

  var timmer;
  window.onscroll = function () {
    if (timmer) {
      return;
    }
    timmer = setTimeout(() => {
      timmer = null;
    }, 1000);
    lazyLoad(imgs);
  };
})();
