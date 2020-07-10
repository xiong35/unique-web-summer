
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