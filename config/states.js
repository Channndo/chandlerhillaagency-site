/**
 * Licensed states for the quote funnel (Tim Doud appointment territory).
 * To add a state later: copy a line below into CHA_LICENSED_STATES.
 *
 * Example:
 *   { code: "OH", name: "Ohio" },
 */
window.CHA_LICENSED_STATES = [
  { code: "IN", name: "Indiana" },
  { code: "MI", name: "Michigan" }
];

(function () {
  function populateStateSelect() {
    var select = document.getElementById("state");
    if (!select || !window.CHA_LICENSED_STATES) return;

    while (select.options.length > 1) {
      select.remove(1);
    }

    window.CHA_LICENSED_STATES.forEach(function (state) {
      var option = document.createElement("option");
      option.value = state.code;
      option.textContent = state.name + " (" + state.code + ")";
      select.appendChild(option);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", populateStateSelect);
  } else {
    populateStateSelect();
  }
})();
