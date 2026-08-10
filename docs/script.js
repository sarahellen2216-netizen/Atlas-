document.addEventListener('DOMContentLoaded', () => {
  // ano no rodapé
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      nav.hidden = expanded;
    });
  }

  // rolagem suave
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.innerWidth <= 700 && nav && menuToggle) {
          nav.hidden = true;
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // formulário (envio simulado)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Por favor, preencha todos os campos corretamente.';
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      status.textContent = 'Enviando...';
      try {
        await new Promise(r => setTimeout(r, 700));
        status.textContent = 'Mensagem enviada com sucesso!';
        form.reset();
      } catch {
        status.textContent = 'Erro ao enviar. Tente novamente.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
