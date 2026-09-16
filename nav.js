(function () {
  var links = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "projects.html", label: "Projects", page: "projects" },
    { href: "contact.html", label: "Contact", page: "contact" },
  ];
  var current = document.body.dataset.page;
  var nav = document.getElementById("site-nav");

  links.forEach(function (link) {
    var a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.label;
    if (link.page === current) a.className = "active";
    nav.appendChild(a);
  });
})();
