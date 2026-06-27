// Lightweight CTA click tracker — safe fallback if analytics isn't configured
(function(){
  function sendEvent(action, label){
    var payload = {event:'cta_click', action: action, label: label, url: location.href, ts: Date.now()};
    if(window.dataLayer && Array.isArray(window.dataLayer)){
      window.dataLayer.push(payload);
      return;
    }
    try{
      if(navigator.sendBeacon){
        var blob = new Blob([JSON.stringify(payload)], {type:'application/json'});
        navigator.sendBeacon('/collect', blob);
        return;
      }
    }catch(e){}
    // fallback
    fetch('/collect', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}).catch(function(){});
  }

  document.addEventListener('DOMContentLoaded', function(){
    var selectors = 'a[href^="tel:"] , a[href^="mailto:"] , a.button, a.service-link, a[href*="booking"]';
    document.querySelectorAll(selectors).forEach(function(el){
      el.addEventListener('click', function(e){
        try{ sendEvent('click', el.getAttribute('href') || el.textContent.trim()); }catch(err){}
      }, {passive:true});
    });
  });
})();
