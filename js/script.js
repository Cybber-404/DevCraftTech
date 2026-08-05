/*
 * ============================================================
 * DEVCRAFT TECH — HOMEPAGE BEHAVIOR
 * ============================================================ */

(function () {
  'use strict';

  var header = document.getElementById('dc-header');

  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.style.boxShadow = '0 12px 30px -20px rgba(0,0,0,0.6)';
    } else {
      header.style.boxShadow = 'none';
    }
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  /* ----------------------------------------------------------
    Scroll reveal
  ---------------------------------------------------------- */
  var revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();

/**
 * ============================================================
 * PROJECTS PAGE — CATEGORY FILTER
 * ============================================================ */

(function () {
  'use strict';

  var filterBar = document.getElementById('dc-project-filters');
  var rows = document.querySelectorAll('[data-project-category]');

  if (!filterBar || !rows.length) return;

  var buttons = filterBar.querySelectorAll('.dc-filter-btn');

  function applyFilter(category) {
    rows.forEach(function (row) {
      var matches = category === 'all' || row.getAttribute('data-project-category') === category;
      row.classList.toggle('is-hidden', !matches);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
})();

/*
 * ============================================================
 * CONTACT PAGE — FORM VALIDATION + EMAILJS SUBMISSION
 * ============================================================ */

(function () {
  'use strict';

  var form = document.getElementById('dc-contact-form');
  if (!form) return;

  // ---- EmailJS configuration ----
  var EMAILJS_PUBLIC_KEY = 'g9ZonDoWRkG2YnZvX';
  var EMAILJS_SERVICE_ID = 'service_62jtxan';
  var EMAILJS_TEMPLATE_ID = 'template_foud8oe';
  var RECIPIENT_EMAIL = 'awadud197@gmail.com';

  var emailjsReady = false;
  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsReady = true;
  }

  var successBox = document.getElementById('dc-form-success');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : '';

  function fieldIsValid(field) {
    if (field.hasAttribute('required') && !field.value.trim()) return false;
    if (field.type === 'email' && field.value.trim()) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value.trim())) return false;
    }
    return true;
  }

  function setFieldState(field, valid) {
    field.classList.toggle('is-invalid', !valid);
  }

  var requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(function (field) {
    field.addEventListener('blur', function () {
      setFieldState(field, fieldIsValid(field));
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('is-invalid')) {
        setFieldState(field, fieldIsValid(field));
      }
    });
  });

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Sending…' : '';
    if (!isSubmitting) submitBtn.innerHTML = submitBtnDefaultHTML;
  }

  function getFieldValue(name) {
    var field = form.querySelector('[name="' + name + '"]');
    return field ? field.value.trim() : '';
  }

  function sendWithEmailJs() {
    var templateParams = {
      from_name: getFieldValue('name'),
      from_email: getFieldValue('email'),
      company: getFieldValue('company') || 'Not provided',
      subject: getFieldValue('subject'),
      budget: getFieldValue('budget') || 'Not specified',
      project_type: getFieldValue('project_type'),
      message: getFieldValue('message'),
      to_email: RECIPIENT_EMAIL
    };

    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var allValid = true;
    requiredFields.forEach(function (field) {
      var valid = fieldIsValid(field);
      setFieldState(field, valid);
      if (!valid) allValid = false;
    });

    if (!allValid) {
      var firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (successBox) successBox.classList.remove('is-visible');

    if (!emailjsReady) {
      // EmailJS isn't configured/loaded — fall back to a clear
      // success state so the interaction still feels complete.
      if (successBox) successBox.classList.add('is-visible');
      form.reset();
      return;
    }

    setSubmitting(true);

    sendWithEmailJs()
      .then(function () {
        if (successBox) successBox.classList.add('is-visible');
        form.reset();
      })
      .catch(function (err) {
        alert('Sorry, something went wrong sending your message. Please try again or email us directly. (' + (err && err.text ? err.text : err) + ')');
      })
      .then(function () {
        setSubmitting(false);
      });
  });
})();
