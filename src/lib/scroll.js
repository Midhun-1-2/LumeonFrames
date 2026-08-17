function scrollTopNow() {
  // `html` carries `scroll-smooth` globally, which silently turns every
  // programmatic scrollTo into a long animated one — from the bottom of a tall
  // page that reads as "the link didn't work". Suspend it for the jump.
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.style.scrollBehavior = previous;
}

export function jumpToTop() {
  scrollTopNow();
  // The router pushes its history entry *after* this click handler returns,
  // and the browser can restore the previous scroll offset onto that entry —
  // undoing the line above. Re-assert once the navigation has settled.
  setTimeout(scrollTopNow, 0);
}
