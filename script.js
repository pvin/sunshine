/**
 * Sunshine Apartment — shared site logic & listings
 */
(function () {
  "use strict";

  /* —— Config —— */
  const CONFIG = {
    phone: "7708744661",
    whatsapp: "https://wa.me/917708744661",
    unitImage: "assets/images/unit-placeholder.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.058!2d77.018674!3d11.081475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8592f5b5e5b5b%3A0x0!2sRathinagiri%20Nagar%2C%20Villankurichi%2C%20Coimbatore!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  };

  /* —— Listings data (migrated from houses.html) —— */
  const OCCUPIED_IDS = new Set(["A-203", "B-114", "B-214", "B-212", "B-124"]);

  const SPECS_2BHK = {
    bhk: 2,
    sqft: "Approximately 950 Sq.ft",
    rent: "₹18,000/month",
    rentNote: "(including ₹1,750 maintenance)",
    advance: "₹9,00,000 (Non-Negotiable)",
    age: "Brand New",
  };

  const SPECS_3BHK = {
    bhk: 3,
    sqft: "Approximately 1300 Sq.ft",
    rent: "₹23,000/month",
    rentNote: "(including ₹2,000 maintenance)",
    advance: "₹1,00,000",
    age: "Brand New",
  };

  function createHouse(number, facing, bhkTier) {
    const specs = bhkTier === 3 ? SPECS_3BHK : SPECS_2BHK;
    const occupied = OCCUPIED_IDS.has(number);
    return {
      number,
      facing,
      occupied,
      status: occupied ? "occupied" : "available",
      image: CONFIG.unitImage,
      ...specs,
    };
  }

  const HOUSES = [
    createHouse("B-111", "West", 2),
    createHouse("B-112", "West", 2),
    createHouse("B-211", "West", 2),
    createHouse("B-212", "West", 2),
    createHouse("B-411", "West", 2),
    createHouse("B-113", "East", 2),
    createHouse("B-114", "East", 2),
    createHouse("B-213", "East", 2),
    createHouse("B-214", "East", 2),
    createHouse("B-413", "East", 2),
    createHouse("B-414", "East", 2),
    createHouse("B-124", "East", 2),
    createHouse("A-203", "East", 3),
  ];

  /* —— Listings UI —— */
  function getSummaryStats(houses) {
    const total = houses.length;
    const occupied = houses.filter((h) => h.occupied).length;
    return {
      total,
      available: total - occupied,
      occupied,
      bhk2: houses.filter((h) => h.bhk === 2).length,
      bhk3: houses.filter((h) => h.bhk === 3).length,
    };
  }

  function renderSummary(container) {
    const stats = getSummaryStats(HOUSES);
    const items = [
      { label: "Total Homes", value: stats.total },
      { label: "Available", value: stats.available },
      { label: "Occupied", value: stats.occupied },
      { label: "2 BHK", value: stats.bhk2 },
      { label: "3 BHK", value: stats.bhk3 },
    ];
    container.innerHTML = `
      <div class="listings-summary" aria-live="polite">
        ${items
          .map(
            (item) => `
          <div class="summary-card">
            <div class="summary-card__value">${item.value}</div>
            <div class="summary-card__label">${item.label}</div>
          </div>`
          )
          .join("")}
      </div>`;
  }

  function renderConditions(container) {
    const box = document.createElement("div");
    box.className = "conditions-box reveal";
    box.innerHTML = `
      <h3>Rental Conditions</h3>
      <ul>
        <li>Families Only</li>
        <li>No Pets</li>
      </ul>`;
    container.appendChild(box);
  }

  function renderFilters(container, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "listings-filters";
    wrap.setAttribute("role", "search");
    wrap.innerHTML = `
      <div class="filter-group filter-group--search">
        <label for="search-input">Search</label>
        <input type="search" id="search-input" placeholder="Search by house number…" autocomplete="off" />
      </div>
      <div class="filter-group">
        <label for="filter-bhk">BHK</label>
        <select id="filter-bhk">
          <option value="all">All BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-facing">Facing</label>
        <select id="filter-facing">
          <option value="all">All Facing</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-availability">Availability</label>
        <select id="filter-availability">
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>
      </div>`;
    container.appendChild(wrap);

    const inputs = wrap.querySelectorAll("input, select");
    inputs.forEach((el) => el.addEventListener("input", onChange));
    inputs.forEach((el) => el.addEventListener("change", onChange));
    return wrap;
  }

  function getFilteredHouses(root) {
    const searchInput = root.querySelector("#search-input");
    const filterBhk = root.querySelector("#filter-bhk");
    const filterFacing = root.querySelector("#filter-facing");
    const filterAvailability = root.querySelector("#filter-availability");

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const bhk = filterBhk ? filterBhk.value : "all";
    const facing = filterFacing ? filterFacing.value : "all";
    const availability = filterAvailability ? filterAvailability.value : "all";

    return HOUSES.filter((house) => {
      if (query && !house.number.toLowerCase().includes(query)) return false;
      if (bhk !== "all" && String(house.bhk) !== bhk) return false;
      if (facing !== "all" && house.facing !== facing) return false;
      if (availability === "available" && house.occupied) return false;
      if (availability === "occupied" && !house.occupied) return false;
      return true;
    });
  }

  function renderHouseCard(house) {
    const occupiedClass = house.occupied ? " house-card--occupied" : "";
    const badgeClass = house.occupied ? "badge--occupied" : "badge--available";
    const badgeText = house.occupied ? "Occupied" : "Available";
    const contactBtn = house.occupied
      ? `<button type="button" class="btn btn--primary is-disabled" disabled>Contact</button>`
      : `<a class="btn btn--primary" href="tel:${CONFIG.phone}">Contact</a>`;

    const sqftShort = house.sqft.replace("Approximately ", "~");

    return `
      <article class="house-card${occupiedClass}" role="listitem">
        <div class="house-card__media">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <img src="${house.image}" alt="Apartment ${house.number}" loading="lazy" width="400" height="300" />
        </div>
        <div class="house-card__body">
          <div class="house-card__top">
            <h3 class="house-card__number">${house.number}</h3>
            <span class="house-card__rent">${house.rent}</span>
          </div>
          <div class="house-card__meta">
            <span>${house.bhk} BHK</span>
            <span>${house.facing} Facing</span>
            <span>${sqftShort}</span>
          </div>
          <p class="house-card__details">
            <strong>Advance:</strong> ${house.advance}<br />
            <strong>Age:</strong> ${house.age}<br />
            ${house.rentNote}
          </p>
          <div class="house-card__footer">${contactBtn}</div>
        </div>
      </article>`;
  }

  function renderListings(root) {
    if (!root) return;

    const mode = root.dataset.listingsMode || "full";
    const limit = parseInt(root.dataset.limit || "0", 10);
    const showSummary = root.dataset.showSummary !== "false";
    const showConditions = root.dataset.showConditions === "true";
    const showFilters = mode !== "preview";

    root.innerHTML = "";
    root.classList.add("listings-root");

    if (showSummary && mode === "full") {
      const summaryMount = document.createElement("div");
      root.appendChild(summaryMount);
      renderSummary(summaryMount);
    }

    if (showConditions) {
      renderConditions(root);
    }

    let filterWrap = null;
    if (showFilters) {
      filterWrap = renderFilters(root, () => updateList(root, limit));
    }

    const listEl = document.createElement("div");
    listEl.className = "listings-stack";
    listEl.setAttribute("role", "list");
    listEl.setAttribute("aria-label", "Property listings");
    root.appendChild(listEl);

    function updateList(container, maxItems) {
      const list = container.querySelector(".listings-stack");
      let filtered = getFilteredHouses(container);
      if (mode === "preview") {
        filtered = filtered.filter((h) => !h.occupied);
      }
      if (maxItems > 0) {
        filtered = filtered.slice(0, maxItems);
      }
      if (filtered.length === 0) {
        list.innerHTML = `<div class="listings-empty">No homes match your search or filters.</div>`;
        return;
      }
      list.innerHTML = filtered.map((h) => renderHouseCard(h)).join("");
    }

    updateList(root, limit || (mode === "preview" ? 4 : 0));

    if (!showFilters && mode === "preview") {
      /* preview: no filters */
    } else if (filterWrap) {
      root._updateListings = () => updateList(root, limit || 0);
    }
  }

  /* —— Navigation —— */
  function initNav() {
    const header = document.getElementById("site-header");
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      menu.querySelectorAll(".nav__link").forEach((link) => {
        link.addEventListener("click", () => {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = header.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });

    const path = window.location.pathname;
    if (path.endsWith("house.html")) {
      document.querySelectorAll('.nav__link[href="#homes"]').forEach((el) => {
        el.classList.add("is-active");
      });
    }
  }

  /* —— Intersection Observer reveals —— */
  function initReveal() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom").forEach((el) => {
      observer.observe(el);
    });

    document.querySelectorAll(".hero .reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  /* —— Hero parallax —— */
  function initHeroParallax() {
    const bg = document.getElementById("hero-bg");
    if (!bg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const y = window.scrollY * 0.35;
            bg.style.transform = `translate3d(0, ${y}px, 0) scale(1.05)`;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* —— Animated counters —— */
  function initCounters() {
    const row = document.getElementById("stats-row");
    if (!row) return;

    const animateValue = (el, end) => {
      const duration = 1600;
      const start = 0;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(start + (end - start) * eased);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = end;
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          row.querySelectorAll("[data-count]").forEach((el) => {
            animateValue(el, parseInt(el.dataset.count, 10));
          });
          observer.disconnect();
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(row);
  }

  /* —— Gallery lightbox —— */
  function initGallery() {
    const grid = document.getElementById("gallery-grid");
    const lightbox = document.getElementById("lightbox");
    const imgEl = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    if (!grid || !lightbox || !imgEl) return;

    const items = [...grid.querySelectorAll(".gallery-item img")];
    let index = 0;
    let lastFocus = null;

    function show(i) {
      index = (i + items.length) % items.length;
      const src = items[index];
      imgEl.src = src.src;
      imgEl.alt = src.alt;
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.hidden = false;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    grid.querySelectorAll(".gallery-item").forEach((fig, i) => {
      fig.addEventListener("click", () => open(i));
      fig.setAttribute("tabindex", "0");
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  /* —— Back to top —— */
  function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => {
        btn.classList.toggle("is-visible", window.scrollY > 600);
      },
      { passive: true }
    );
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* —— Copy phone —— */
  function initCopyPhone() {
    const btn = document.getElementById("copy-phone");
    const toast = document.getElementById("toast");
    if (!btn || !toast) return;

    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.phone);
        toast.textContent = "Phone number copied!";
      } catch {
        toast.textContent = "Could not copy — please dial manually.";
      }
      toast.classList.add("is-visible");
      clearTimeout(initCopyPhone._t);
      initCopyPhone._t = setTimeout(() => toast.classList.remove("is-visible"), 2500);
    });
  }

  /* —— Footer year —— */
  function initYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* —— Init —— */
  function init() {
    initNav();
    initReveal();
    initHeroParallax();
    initCounters();
    initGallery();
    initBackToTop();
    initCopyPhone();
    initYear();

    const homesRoot = document.getElementById("homes-root");
    if (homesRoot) {
      renderListings(homesRoot);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.SunshineListings = { renderListings, HOUSES, CONFIG };
})();
