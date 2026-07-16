/* ==========================================================
   AVIS CLIENTS — chargement et soumission via Supabase
   - Affiche les avis dont "approved = true"
   - Permet à un visiteur d'en soumettre un nouveau (non approuvé
     par défaut, en attente de validation manuelle dans Supabase)
   ========================================================== */

(function () {
  const container = document.getElementById('reviewsContainer');
  const statAvg = document.getElementById('statAvg');
  const statCount = document.getElementById('statCount');
  const form = document.getElementById('reviewForm');
  const formMsg = document.getElementById('reviewFormMsg');

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function starString(rating) {
    const n = Math.max(0, Math.min(5, Number(rating) || 0));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function renderReviews(reviews) {
    if (!container) return;

    if (!reviews || reviews.length === 0) {
      container.innerHTML = '<p class="reviews__empty mono">Aucun avis publié pour le moment. Soyez le premier à en laisser un !</p>';
      return;
    }

    container.innerHTML = reviews.map((r, i) => `
      <article class="review plate" data-tag="AVIS // ${String(i + 1).padStart(3, '0')}">
        <div class="review__header">
          <div>
            <div class="review__author">${escapeHtml(r.author)}</div>
            ${r.tier ? `<div class="review__tier mono">${escapeHtml(r.tier)}</div>` : ''}
          </div>
          <div class="review__rating mono">${starString(r.rating)}</div>
        </div>
        <p class="review__body">${escapeHtml(r.body)}</p>
        <div class="review__footer">
          <span>${formatDate(r.created_at)}</span>
          <span class="review__project">${escapeHtml(r.project || '')}</span>
        </div>
      </article>
    `).join('');
  }

  function updateStats(reviews) {
    const count = reviews ? reviews.length : 0;
    if (statCount) statCount.textContent = String(count);
    if (statAvg) {
      if (count === 0) {
        statAvg.innerHTML = '—';
      } else {
        const avg = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count;
        statAvg.innerHTML = `${avg.toFixed(1)}<span style="font-size:1rem; color: var(--text-dim);">/5</span>`;
      }
    }
  }

  async function loadReviews() {
    if (!container) return;
    container.innerHTML = '<p class="reviews__empty mono">Chargement des avis…</p>';

    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur de chargement des avis :', error);
      container.innerHTML = '<p class="reviews__empty mono">Impossible de charger les avis pour le moment.</p>';
      return;
    }

    renderReviews(data);
    updateStats(data);
  }

  function setFormMessage(text, type) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.className = 'form-msg' + (type ? ` form-msg--${type}` : '');
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);

      const payload = {
        author: (formData.get('author') || '').toString().trim(),
        tier: (formData.get('tier') || '').toString().trim(),
        project: (formData.get('project') || '').toString().trim(),
        rating: parseInt(formData.get('rating'), 10),
        body: (formData.get('body') || '').toString().trim(),
        approved: false
      };

      if (!payload.author || !payload.body || !payload.rating) {
        setFormMessage('Merci de remplir au minimum votre nom, une note et un commentaire.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi…';

      const { error } = await supabaseClient.from('reviews').insert(payload);

      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer mon avis';

      if (error) {
        console.error("Erreur d'envoi de l'avis :", error);
        setFormMessage('Une erreur est survenue, réessayez plus tard.', 'error');
        return;
      }

      form.reset();
      setFormMessage('Merci ! Votre avis a bien été envoyé et sera visible après validation.', 'success');
    });
  }

  loadReviews();
})();