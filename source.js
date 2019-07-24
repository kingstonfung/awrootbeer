(() => {
  const couponElement = document.querySelector('.mobile-print');
  document.querySelector('.countdown').classList.remove('hide');
  document.querySelector('.redeem-section').classList.add('hide');
  document.querySelector('.mobile-details.redeemed').classList.add('hide');
  couponElement.classList.remove('hide');
  
  const msToClock = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  };

  let countdown = 1080000;
  setInterval(() => document.querySelector('.clock').innerHTML = msToClock(countdown -= 500), 500);

  const sampleDiv = document.createTextNode('-- COUPON IS NOT VALID, DO NOT REDEEM --');
  couponElement.parentNode.insertBefore(sampleDiv, couponElement.nextSibling);
  document.querySelector('.redeem-mobile-coupon').prepend(sampleDiv);
})();
