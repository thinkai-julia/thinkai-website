(function(){
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel){
    toggle.addEventListener('click', function(){ panel.classList.toggle('open'); });
  }

  // Mark the current page's nav link(s) active — service subpages also light up the
  // "Services" parent link and their own entry in the dropdown. The parent-link fallback
  // only applies to top-level links: the dropdown's "Overview" shares href="services.html"
  // with the parent and must only light up when it IS the current page.
  (function highlightActiveNav(){
    var last = location.pathname.split('/').pop();
    var currentPage = last && last.length ? last : 'index.html';
    var isServiceSubpage = /^service-/.test(currentPage);
    var topLevel = document.querySelectorAll('.site-header nav > a, .nav-services > a, .mobile-panel a:not(.btn)');
    topLevel.forEach(function(a){
      var href = a.getAttribute('href');
      if (href === currentPage || (isServiceSubpage && href === 'services.html')){
        a.classList.add('active');
      }
    });
    document.querySelectorAll('.nav-services .dropdown a').forEach(function(a){
      if (a.getAttribute('href') === currentPage) a.classList.add('active');
    });
  })();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(a, b){ return a + Math.random() * (b - a); }
  // skews toward `a` as power increases — real spatter is mostly small droplets with rare big ones
  function biasedRand(a, b, power){ return a + Math.pow(Math.random(), power || 1) * (b - a); }

  // Gutter-only placement: keeps every decoration in the left/right margins
  // outside the centered .wrap content column, so paint never lands on text.
  // Loosened and asymmetric on purpose — a real hand doesn't splatter paint on a grid.
  // `tight` shrinks the overhang for narrow boxed panels (.form-module), where the same
  // percentages that read as "just off the edge" on a full-bleed band cover real text.
  function gutterAnchor(tight){
    var onLeft = Math.random() < 0.5;
    var left = tight
      ? (onLeft ? rand(-7, 4) : rand(96, 107))
      : (onLeft ? rand(-12, 10) : rand(86, 110));
    var top = tight ? rand(-8, 104) : rand(-11, 107);
    return { top: top, left: left };
  }

  var blotVariants = [1,2,3,4,5,6,7,8,9,10,14,15];
  var strokeVariants = [11,12,13];

  // A small real ink blot (same PNG pool as the big marks, just tiny) — used for the
  // satellite droplets and stray dots instead of solid CSS circles, so every speck of
  // paint on the page has a real organic silhouette instead of a perfect circle.
  function makeSmallBlot(minPx, maxPx, top, left){
    var v = blotVariants[Math.floor(Math.random() * blotVariants.length)];
    var el = document.createElement('img');
    el.className = 'splash-decor' + (Math.random() < 0.5 ? ' soft' : '');
    el.src = 'assets/img/splash-' + (v < 10 ? '0' + v : v) + '.png';
    el.alt = '';
    el.style.position = 'absolute';
    el.style.width = Math.floor(biasedRand(minPx, maxPx, 2.2)) + 'px';
    el.style.top = top.toFixed(1) + '%';
    el.style.left = left.toFixed(1) + '%';
    el.style.setProperty('--r', Math.floor(rand(0, 359)) + 'deg');
    el.setAttribute('data-parallax', rand(0.03, 0.15).toFixed(2));
    return el;
  }

  // Paint doesn't land as an even grid of independent marks — it hits in a handful of
  // impact points, each with one dominant blot or brush stroke and a spray of smaller
  // droplets flung outward at random distance/angle, plus a few fully stray dots so the
  // whole thing doesn't read as tidy clusters either. Timing is desynced per element so
  // nothing pulses in visible unison.
  function scatterPaint(){
    var sections = document.querySelectorAll('.band, .form-module');
    sections.forEach(function(section){
      // .form-module is a boxed ~1100px panel, not a full-bleed viewport-width band —
      // the same gutter %/throw distances would land squarely on its headline otherwise.
      var tight = section.classList.contains('form-module');

      var anchorCount = Math.floor(tight ? rand(3, 5) : rand(5, 8));
      for (var a = 0; a < anchorCount; a++){
        var anchor = gutterAnchor(tight);

        var isStroke = Math.random() < 0.4;
        var pool = isStroke ? strokeVariants : blotVariants;
        var v = pool[Math.floor(Math.random() * pool.length)];
        var img = document.createElement('img');
        img.className = 'splash-decor' + (isStroke ? ' stroke' : '') + (Math.random() < 0.55 ? ' soft' : '');
        img.setAttribute('data-parallax', rand(0.04, 0.17).toFixed(2));
        img.src = 'assets/img/splash-' + (v < 10 ? '0' + v : v) + '.png';
        img.alt = '';
        img.style.position = 'absolute';
        img.style.top = (anchor.top + rand(-2.5, 2.5)).toFixed(1) + '%';
        img.style.left = (anchor.left + rand(-2.5, 2.5)).toFixed(1) + '%';
        img.style.width = Math.floor(tight
          ? (isStroke ? rand(110, 210) : rand(45, 130))
          : (isStroke ? rand(150, 390) : rand(60, 235))) + 'px';
        img.style.setProperty('--r', Math.floor(isStroke ? rand(-32, 32) : rand(0, 359)) + 'deg');
        img.style.animationDelay = rand(0, 0.9).toFixed(2) + 's, ' + rand(0, 3).toFixed(2) + 's';
        section.appendChild(img);

        var dropCount = Math.floor(tight ? rand(0, 3) : rand(1, 6));
        for (var d = 0; d < dropCount; d++){
          var throwDist = tight ? rand(0.8, 3.5) : rand(1.5, 10);
          var throwAngle = rand(0, Math.PI * 2);
          var dot = makeSmallBlot(
            14, tight ? 46 : 90,
            anchor.top + Math.sin(throwAngle) * throwDist,
            anchor.left + Math.cos(throwAngle) * throwDist
          );
          dot.style.animationDelay = rand(0, 1.1).toFixed(2) + 's, ' + rand(0, 2.5).toFixed(2) + 's';
          section.appendChild(dot);
        }
      }

      var strayCount = Math.floor(tight ? rand(1, 3) : rand(4, 9));
      for (var s = 0; s < strayCount; s++){
        var strayAnchor = gutterAnchor(tight);
        var stray = makeSmallBlot(14, tight ? 38 : 70, strayAnchor.top, strayAnchor.left);
        stray.style.animationDelay = rand(0, 1.4).toFixed(2) + 's, ' + rand(0, 3).toFixed(2) + 's';
        section.appendChild(stray);
      }
    });
  }
  scatterPaint();

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting) e.target.classList.add('is-in'); });
  }, {threshold:.2});
  document.querySelectorAll('.reveal, .splash-decor').forEach(function(el){ io.observe(el); });

  if (!reduceMotion) {
    var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (parallaxEls.length) {
      // rAF-gated: a fast fling can fire dozens of scroll events before the next
      // paint, and each pass does a getBoundingClientRect() per element (up to a
      // few hundred on services.html) — capping the real work to once per frame
      // keeps that from turning into visible scroll jank.
      var parallaxTicking = false;
      var updateParallax = function(){
        var vh = window.innerHeight;
        parallaxEls.forEach(function(el){
          var factor = parseFloat(el.getAttribute('data-parallax')) || 0.1;
          var rect = el.getBoundingClientRect();
          var centerOffset = (rect.top + rect.height/2) - vh/2;
          el.style.setProperty('--py', (centerOffset * -factor * 0.15) + 'px');
        });
        parallaxTicking = false;
      };
      var onParallaxScroll = function(){
        if (!parallaxTicking) {
          requestAnimationFrame(updateParallax);
          parallaxTicking = true;
        }
      };
      document.addEventListener('scroll', onParallaxScroll, {passive:true});
      updateParallax();
    }
  }

  if (!reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.28) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  // Static site, no backend of our own — Web3Forms receives the POST and relays it
  // to CONTACT_EMAIL as a real email, no mail client required on the visitor's end.
  var CONTACT_EMAIL = 'thinkai.julia@gmail.com';
  var WEB3FORMS_KEY = 'feae7f1a-dedf-42d8-a0a3-9b79f419c977';

  document.querySelectorAll('.real-form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();

      var lines = [];
      var checkboxGroups = {};
      Array.prototype.forEach.call(form.elements, function(el){
        if (!el.name || el.type === 'submit' || el.type === 'button') return;
        if (el.type === 'checkbox'){
          if (!el.checked) return;
          checkboxGroups[el.name] = checkboxGroups[el.name] || [];
          checkboxGroups[el.name].push(el.value);
          return;
        }
        var val = (el.value || '').trim();
        if (!val) return;
        lines.push((el.getAttribute('data-label') || el.name) + ': ' + val);
      });
      Object.keys(checkboxGroups).forEach(function(name){
        var fieldEl = form.querySelector('[name="' + name + '"]');
        var label = (fieldEl && fieldEl.getAttribute('data-label')) || name;
        lines.push(label + ': ' + checkboxGroups[name].join(', '));
      });

      var pageName = document.title.split('|')[0].trim() || 'ThinkAI';
      var subject = 'Strategy call request — ' + pageName + ' page';
      var nameField = form.querySelector('input[name="fullName"]');
      var emailField = form.querySelector('input[type="email"]');

      var success = form.parentElement.querySelector('.form-success');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          to: CONTACT_EMAIL,
          subject: subject,
          from_name: (nameField && nameField.value) || 'ThinkAI website',
          email: (emailField && emailField.value) || undefined,
          message: lines.join('\n'),
          page: window.location.href
        })
      }).then(function(r){ return r.json(); }).then(function(data){
        if (!data.success) throw new Error(data.message || 'Submission failed');
        form.style.display = 'none';
        if (success) success.classList.add('show');
      }).catch(function(){
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
        alert('Something went wrong sending your request. Please email us directly at ' + CONTACT_EMAIL + ' or try again.');
      });
    });
  });
})();
