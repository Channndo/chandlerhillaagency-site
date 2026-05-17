/* TEMPORARY DISCLOSURE — REMOVE WHEN CHANDLER HILL AGENCY OPERATES UNDER ITS OWN APPOINTMENTS
 *
 * Injects the Tim Doud Allstate disclaimer into every [data-temp-disclosure-mount].
 * See components/temp-disclosure/README.md for full removal steps.
 */

(function () {
  var MOUNT_SELECTOR = "[data-temp-disclosure-mount]";
  var COMPONENT_BASE = "components/temp-disclosure/";
  var mounts = document.querySelectorAll(MOUNT_SELECTOR);

  if (!mounts.length) return;

  function loadStylesheet() {
    if (document.querySelector("link[data-temp-disclosure-styles]")) return;

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = COMPONENT_BASE + "disclosure.css";
    link.setAttribute("data-temp-disclosure-styles", "");
    document.head.appendChild(link);
  }

  function loadMarkup() {
    return fetch(COMPONENT_BASE + "disclosure.html").then(function (res) {
      if (!res.ok) throw new Error("Disclosure markup failed to load");
      return res.text();
    });
  }

  loadStylesheet();
  loadMarkup()
    .then(function (html) {
      mounts.forEach(function (mount) {
        mount.innerHTML = html;
      });
    })
    .catch(function () {
      mounts.forEach(function (mount) {
        mount.remove();
      });
    });
})();
