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
                }
              </div>
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
