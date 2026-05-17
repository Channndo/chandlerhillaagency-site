// IMPORTANT:
// After you deploy the Apps Script Web App (Step 4), paste the Web App URL here:
window.CHA_API_URL = "https://script.google.com/macros/s/AKfycbyts5KYOrDAqtNY4LXzuhoPL1g6cHB1yP5kQxuUNCiLgelw6GyUQ-6IKU3E-kQGni9e/exec";

(function(){
  const form = document.getElementById('leadForm');
  const btn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  const formView = document.getElementById('formView');
  const thankYouView = document.getElementById('thankYouView');
  const tyName = document.getElementById('tyName');
  const newRequestBtn = document.getElementById('newRequestBtn');

  const typeEl = document.getElementById('type');
  const carCountWrap = document.getElementById('carCountWrap');
  const heardAboutWrap = document.getElementById('heardAboutWrap');
  const heardAboutEl = document.getElementById('heardAbout');
  const referralWrap = document.getElementById('referralWrap');
  const referrerPhoneEl = document.getElementById('referrerPhone');
  const referrerEmailEl = document.getElementById('referrerEmail');
  const referrerAddressEl = document.getElementById('referrerAddress');

  const REFERRAL_SOURCE = 'Friend or Colleague';

  function cleanPhone(v){
    return (v || '').replace(/[^\d]/g,'').slice(0, 15);
  }

  function showToast(msg, ok){
    if(!msg){
      toast.classList.add('hidden');
      toast.textContent = '';
      return;
    }
    toast.classList.remove('hidden');
    toast.style.background = ok ? '#111827' : '#7f1d1d';
    toast.textContent = msg;
  }

  function showThankYou(firstName){
    tyName.textContent = firstName ? `, ${firstName}` : '';
    formView.classList.add('hidden');
    thankYouView.classList.remove('hidden');
  }

  function clearReferralFields(){
    if (referrerPhoneEl) referrerPhoneEl.value = '';
    if (referrerEmailEl) referrerEmailEl.value = '';
    if (referrerAddressEl) referrerAddressEl.value = '';
  }

  function updateCarCountVisibility(){
    const v = (typeEl.value || '').toLowerCase();
    const show = v.indexOf('auto') !== -1 || v === 'bundle';
    carCountWrap.classList.toggle('hidden', !show);
  }

  function updateHeardAboutVisibility(){
    const hasType = !!(typeEl.value || '').trim();
    heardAboutWrap.classList.toggle('hidden', !hasType);
    if (!hasType && heardAboutEl) {
      heardAboutEl.value = '';
      updateReferralVisibility();
    }
  }

  function updateReferralVisibility(){
    const isReferral = (heardAboutEl.value || '') === REFERRAL_SOURCE;
    referralWrap.classList.toggle('hidden', !isReferral);
    if (!isReferral) clearReferralFields();
  }

  function updateFormSections(){
    updateCarCountVisibility();
    updateHeardAboutVisibility();
    updateReferralVisibility();
  }

  function resetForm(){
    form.reset();
    showToast('', true);
    formView.classList.remove('hidden');
    thankYouView.classList.add('hidden');
    updateFormSections();
  }

  typeEl.addEventListener('change', updateFormSections);
  heardAboutEl.addEventListener('change', updateReferralVisibility);
  updateFormSections();

  newRequestBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async function(e){
    e.preventDefault();

    if(!window.CHA_API_URL || window.CHA_API_URL.includes("PASTE_YOUR")){
      showToast("⚠️ Backend not connected. Paste your Apps Script Web App URL in main.js.", false);
      return;
    }

    btn.disabled = true;
    showToast('Submitting...', true);

    const payload = {
      firstName: (document.getElementById('firstName').value || '').trim(),
      lastName:  (document.getElementById('lastName').value || '').trim(),
      email:     (document.getElementById('email').value || '').trim(),
      phone:     cleanPhone(document.getElementById('phone').value),
      street:    (document.getElementById('street').value || '').trim(),
      city:      (document.getElementById('city').value || '').trim(),
      state:     (document.getElementById('state').value || '').trim(),
      zip:       (document.getElementById('zip').value || '').trim(),
      type:      (typeEl.value || '').trim(),
      carCount:  (document.getElementById('carCount').value || '').trim(),
      heardAbout: (heardAboutEl.value || '').trim(),
      referrerPhone: cleanPhone(referrerPhoneEl ? referrerPhoneEl.value : ''),
      referrerEmail: (referrerEmailEl ? referrerEmailEl.value : '').trim(),
      referrerAddress: (referrerAddressEl ? referrerAddressEl.value : '').trim()
    };

    try{
      const resp = await fetch(window.CHA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const res = await resp.json();
      btn.disabled = false;

      if(res && res.ok){
        showToast("", true);
        showThankYou(payload.firstName);
      } else {
        showToast("⚠️ " + (res && res.error ? res.error : "Something went wrong."), false);
      }
    } catch (err){
      btn.disabled = false;
      showToast("⚠️ Error submitting. Try again.", false);
    }
  });
})();
