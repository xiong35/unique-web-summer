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
