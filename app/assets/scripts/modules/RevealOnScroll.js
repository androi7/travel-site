import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'

class RevealOnScroll {
  constructor(els, thresholdPercent=80) {
    this.thresholdPercent = thresholdPercent;
    this.itemsToReveal = els;
    this.browserHeight = window.innerHeight;
    this.hideInitially();
    this.scrollThrottle = throttle(this.calcCaller, 200).bind(this);
    this.events();
  }

  events() {
    window.addEventListener("scroll", this.scrollThrottle);
    window.addEventListener("resize", debounce(() => {
      // debounce waits till event is finished and then waits for 333ms before performing action
      this.browserHeight = window.innerHeight;
    }, 333));
  }

  calcCaller() {
    this.itemsToReveal.forEach(el => {
      if (el.isRevealed == false) {
        this.calculateIfScrollTo(el);
      }
    });
  }

  calculateIfScrollTo(el) {
    // window.scrollY: number of pixels that the document is currently scrolled vertically
    // window.innerHeight: interior height of the window in pixels, including the height of the horizontal scroll bar
    // HTMLElement.offsetTop: distance of the outer border of the current element relative to the inner border of the top of the offsetParent node
    if (window.scrollY + this.browserHeight > el.offsetTop) {
      // IE: el.getBoundingClientRect().top
      // better to use intersection observer -> more efficient
      let scrollPercent = (el.getBoundingClientRect().y / this.browserHeight) * 100
      if (scrollPercent < this.thresholdPercent) {
        el.classList.add("reveal-item--is-visible");
        el.isRevealed = true;
        if (el.isLastItem) {
          window.removeEventListener("scroll", this.scrollThrottle);
        }
      }
    }
  }

  hideInitially() {
    this.itemsToReveal.forEach(el => {
      el.classList.add("reveal-item");
      el.isRevealed = false;
    });
    this.itemsToReveal[this.itemsToReveal.length - 1].isLastItem = true;
  }
}

export default RevealOnScroll;
