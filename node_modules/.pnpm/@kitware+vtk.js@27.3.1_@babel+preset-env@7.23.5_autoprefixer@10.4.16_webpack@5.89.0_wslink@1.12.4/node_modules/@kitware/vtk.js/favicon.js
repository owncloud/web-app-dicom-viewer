var head = document.querySelector('head');

if (head) {
  [16, 32, 96, 160, 196].forEach(function (resolution) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('href', "https://kitware.github.io/vtk-js/icon/favicon-".concat(resolution, "x").concat(resolution, ".png"));
    link.setAttribute('sizes', "".concat(resolution, "x").concat(resolution));
    link.setAttribute('type', 'image/png');
    head.appendChild(link);
  });
}
