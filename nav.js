(function () {
  const header = document.getElementById("siteHeader");
  const navLinks = document.querySelectorAll("[data-section]");
  const panels = document.querySelectorAll(".section-panel");
  const floatingCta = document.getElementById("floatingCta");
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileNav = document.getElementById("mobileNav");

  function setActiveSection(id) {
    panels.forEach(function (panel) {
      const active = panel.dataset.panel === id;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });

    navLinks.forEach(function (link) {
      const active = link.dataset.section === id;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-current", active ? "page" : "false");
    });

    if (mobileNav) {
      mobileNav.classList.remove("is-open");
      mobileToggle.setAttribute("aria-expanded", "false");
    }

    if (floatingCta) {
      floatingCta.classList.toggle("is-hidden", id === "quotes");
    }

    document.body.dataset.activeSection = id;
    if (window.location.hash !== "#" + id) {
      history.replaceState(null, "", "#" + id);
    }

    if (id === "quotes") {
      window.requestAnimationFrame(function () {
        const first = document.getElementById("firstName");
        if (first && !first.closest(".hidden")) {
          first.focus({ preventScroll: true });
        }
      });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    var activePanel = document.querySelector('.section-panel[data-panel="' + id + '"]');
    if (activePanel) {
      window.requestAnimationFrame(function () {
        activePanel.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
          revealObserver.observe(el);
        });
      });
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveSection(link.dataset.section);
    });
  });

  if (floatingCta) {
    floatingCta.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveSection("quotes");
    });
  }

  document.querySelectorAll("[data-goto-quotes]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveSection("quotes");
    });
  });

  document.querySelectorAll("[data-scroll-target]").forEach(function (el) {
    el.addEventListener("click", function () {
      var targetId = el.getAttribute("data-scroll-target");
      var target = document.getElementById(targetId);
      if (!target) return;

      if (document.body.dataset.activeSection !== "products") {
        setActiveSection("products");
      }

      window.setTimeout(function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    });
  });

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  window.addEventListener("scroll", function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    revealObserver.observe(el);
  });

  var headerBrand = document.querySelector(".header-brand");
  if (headerBrand) {
    headerBrand.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveSection("about");
    });
  }

  var hash = (window.location.hash || "").replace("#", "");
  var sections = ["about", "products", "locations", "quotes"];

  if (sections.indexOf(hash) !== -1) {
    setActiveSection(hash);
  } else {
    setActiveSection("quotes");
  }

  window.addEventListener("hashchange", function () {
    var h = (window.location.hash || "").replace("#", "");
    if (sections.indexOf(h) !== -1) {
      setActiveSection(h);
    }
  });
})();
