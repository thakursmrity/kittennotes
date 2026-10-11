(function () {
  var KEY = "kn_cart";
  var EMAIL = "info@kittennotes.com";
  var memory = [];

  function load() {
    try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : memory; }
    catch (e) { return memory; }
  }
  function save(cart) {
    memory = cart;
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    updateCount();
  }
  function rs(n) { return "Rs. " + n.toLocaleString("en-IN"); }
  function updateCount() {
    var n = load().reduce(function (s, i) { return s + i.qty; }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n; });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Product page: gallery thumbnails
  var main = document.querySelector("[data-main]");
  document.querySelectorAll(".thumb").forEach(function (t) {
    t.addEventListener("click", function () {
      main.src = t.dataset.src;
      document.querySelectorAll(".thumb").forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active");
    });
  });

  // Product page: variant select
  var variant = document.querySelector("[data-variant]");
  if (variant) {
    var onVariant = function () {
      var o = variant.selectedOptions[0];
      document.querySelector("[data-price]").textContent = rs(+o.dataset.price);
      document.querySelector("[data-compare]").textContent = rs(+o.dataset.compare);
      main.src = o.dataset.image;
    };
    variant.addEventListener("change", onVariant);
    onVariant();
  }

  // Product page: add to cart
  var addBtn = document.querySelector("[data-add]");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      var p = JSON.parse(addBtn.dataset.add);
      var qty = Math.max(1, parseInt(document.querySelector("[data-qty]").value, 10) || 1);
      var item = { id: p.id, name: p.name, price: p.price, image: p.image };
      if (variant) {
        var o = variant.selectedOptions[0];
        item.id = o.value;
        item.name = p.name + " (" + o.textContent.replace(/ \(Rs\. \d+\)$/, "") + ")";
        item.price = +o.dataset.price;
        item.image = o.dataset.image.replace(/width=\d+/, "width=300");
      }
      var cart = load();
      var found = cart.find(function (c) { return c.id === item.id; });
      if (found) found.qty += qty; else { item.qty = qty; cart.push(item); }
      save(cart);
      document.querySelector("[data-added]").hidden = false;
    });
  }

  // Shop page: filters
  document.querySelectorAll("[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(function (c) { c.classList.toggle("active", c === chip); });
      document.querySelectorAll("[data-grid] > [data-type]").forEach(function (el) {
        el.hidden = !(f === "all" || el.dataset.type === f);
      });
    });
  });

  // Cart page
  var list = document.querySelector("[data-cart-items]");
  function renderCart() {
    var cart = load();
    var empty = cart.length === 0;
    document.querySelector("[data-cart-empty]").hidden = !empty;
    document.querySelector("[data-checkout]").hidden = empty;
    list.innerHTML = cart.map(function (i, idx) {
      return '<div class="cart-row"><img src="' + esc(i.image) + '" alt="">' +
        '<div><div class="name">' + esc(i.name) + '</div><div class="muted">' + rs(i.price) + ' each</div>' +
        '<div class="qty"><button data-dec="' + idx + '" aria-label="Decrease">-</button><span>' + i.qty +
        '</span><button data-inc="' + idx + '" aria-label="Increase">+</button>' +
        '<button class="remove" data-rm="' + idx + '">Remove</button></div></div>' +
        '<div class="price">' + rs(i.price * i.qty) + '</div></div>';
    }).join("");
    var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    document.querySelector("[data-cart-total]").textContent = rs(total);
  }
  if (list) {
    list.addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      var cart = load();
      if (b.dataset.inc) cart[+b.dataset.inc].qty++;
      if (b.dataset.dec) { var i = +b.dataset.dec; cart[i].qty--; if (cart[i].qty < 1) cart.splice(i, 1); }
      if (b.dataset.rm) cart.splice(+b.dataset.rm, 1);
      save(cart); renderCart();
    });
    renderCart();

    document.querySelector("[data-order-form]").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(ev.target);
      var cart = load();
      var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      var lines = cart.map(function (i) { return "- " + i.name + " x " + i.qty + " = " + rs(i.price * i.qty); });
      var body = [
        "Hi Kitten Notes, I would like to place this order:", "",
        lines.join("\n"), "", "Total: " + rs(total) + " (free shipping)", "",
        "Name: " + d.get("name"), "Email: " + d.get("email"), "Phone: " + d.get("phone"),
        "Address: " + d.get("address"), d.get("city") + ", " + d.get("state") + " " + d.get("pin"),
        d.get("note") ? "\nNote: " + d.get("note") : ""
      ].join("\n");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("New order from " + d.get("name")) +
        "&body=" + encodeURIComponent(body);
    });
  }

  // Contact form
  var contact = document.querySelector("[data-contact-form]");
  if (contact) {
    contact.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(contact);
      var body = d.get("message") + "\n\n" + (d.get("name") || "") + "\n" + d.get("email") + "\n" + (d.get("phone") || "");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Message from " + (d.get("name") || d.get("email"))) +
        "&body=" + encodeURIComponent(body);
    });
  }

  // Newsletter signup
  document.querySelectorAll("[data-signup]").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = new FormData(f).get("email");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Sign me up for 10% off") +
        "&body=" + encodeURIComponent("Please add " + email + " to the Kitten Notes list.");
    });
  });

  updateCount();
})();
