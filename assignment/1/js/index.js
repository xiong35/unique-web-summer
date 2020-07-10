// simulate jQuery
function $(query, all = false) {
  if (all) {
    return document.querySelectorAll(query);
  }
  return document.querySelector(query);
}

// axios
const instance = axios.create({
  baseURL: "http://xiong35.cn:7770/rstar/",
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

// lazy loading
function lazyLoad(imgs) {
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  imgs.forEach((it) => {
    if (!it.classList.contains("lazy")) {
      return;
    }
    if (it.offsetTop - scrollTop - clientHeight < 150) {
      it.src = it.dataset.src;
      it.classList.remove("lazy");
    }
  });
}
function load() {
  const imgs = $(".card-container img.lazy", true);

  var timmer;
  window.onscroll = () => {
    if (timmer) {
      return;
    }
    timmer = setTimeout(() => {
      timmer = null;
    }, 100);
    lazyLoad(imgs);
  };
}

async function renderPosts() {
  const newsContainer = $(".newswire .card-container");

  let res;
  try {
    res = await getPosts();
    if (res.status !== 200) {
      raise(res);
    }
  } catch (err) {
    console.log(err);
    newsContainer.innerHTML = "<h1>something went wrong</h1>";
  }
  const posts = res.data.posts.slice(0, 6);

  const postsHTML = posts.map((it, ind) => {
    const imgUrl = ind
      ? it.preview_images_parsed["newswire-block-square"].src
      : it.preview_images_parsed["newswire-block-16x9"].src;

    let flex;
    switch (ind) {
      case 0:
        flex = 12;
        break;
      case 1:
      case 2:
        flex = 6;
        break;
      default:
        flex = 4;
    }

    return `
      <a href="${it.link}" class="card flex-${flex}">
      <div class="${ind ? "fix-1-1" : ""}">
        <img
        data-src="${imgUrl}"
        alt="${it.title}"
        class="lazy"
        />
      </div>
          <div class="card-info">
            <h1>${it.title}"</h1>
            <div class="card-subtitle">
              <i class="fa fa-star"></i>${
                it.primary_tags[0].name
              }</div>
            <span class="card-date">${
              it.created_formatted
            }</span>
          </div> 
      </a>`;
  });

  newsContainer.innerHTML = postsHTML.join("");
}

async function renderGames() {
  const gameContainer = $(".featured-games .card-container");

  let res;
  try {
    res = await getGames();
    if (res.status !== 200) {
      raise(res);
    }
  } catch (err) {
    console.log(err);
    gameContainer.innerHTML = "<h1>something went wrong</h1>";
  }
  const games = res.data.games.slice(0, 4);
  console.log(games);

  const gameHTML = games.map((it, ind) => {
    return `
    <a href="${it.link}" class="card flex-3">
      <img
        data-src="https://www.rockstargames.com/${it.fob_640}"
        alt="${it.title}"
        class="lazy"
        />
        </a> `;
  });

  gameContainer.innerHTML = gameHTML.join("");
}

(async function () {
  await renderPosts();
  await renderGames();

  load();

  lazyLoad($(".card-container img.lazy", true));

  $(".body").classList.remove("loading");
  $(".nav-background").style.animationPlayState = "paused";
})();

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
