# Review and thoughts on A&W's free root beer coupon implementation:

## Disclaimer:
The following is a technical review of A&W's implementation of their "Free Regular Root Beer" coupon, and flaws that I can see with this approach. By no means anyone should use this method to exploit A&W to gain free drinks beyond their terms and conditions. All codes shared in this example have sample text rendered to indicate the coupon revealed is not valid. I personally have not used this approach to receive a free root beer.

I encourage everyone to visit https://awcoupon.ca for full details, and go see the coupons they offer publicly.

## Motivation:
As a web developer, I always stand by my principle:
> If you never want people to see it, don't put it at the front end.

Although a free root beer is probably negligible disruptions to their business, but imagine the potential loss if this same approach is implemented to larger discounts. So I hope this exercise can provide some insight to other fellow developers when it comes to security and business logic considerations.

## Their Implementation:
By creating an account with A&W, you are eligible to receive one free regular size root beer. Once redemption starts, you have 20 minutes to redeem the free drink presumably you are already at the restaurant, lining up, or on your way to one.

This eligibility is set by a backend token, stored as a cookie in your browser. So if you try to redeem the coupon more than once they will simply reject the request and send you back to their home page. As the user triggers the redemption process, it will conduct an ajax call, and then a specific piece of JavaScript code will run to reveal the coupon (if eligible).
 
Unfortunately, everything that requires to reveal the coupon is actually rendered at the DOM regardless of the customer's state. They have only hide the visibility using css styling through a class named `hide`.
 
For example:
> `<img alt="" class="mobile-print hide" src="https://awcoupon.ca/storage/app/uploads/public/5aa/625/0a3/5aa6250a3a6a9982113752.jpg">`

This makes it very easy for someone to manipulate. The only difficult part is recreating the timer, and being able to run an user-side script on a mobile device live on the site.

## The Code:
The code I came up with to toggle the UI state into the coupon view is relatively easy, all we have to do is reveal the coupon, hide the greeting elements, and then start a 20-minute timer:

```
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
```

![Demo](https://github.com/kingstonfung/awrootbeer/blob/master/rootbeer-demo.gif?raw=true)

To run the code on your mobile device, we can simply create a [Bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) by creating a blank bookmark, and then changing the URL to the following:

```
javascript:(function()%7B(()%20%3D%3E%20%7Bconst%20couponElement%20%3D%20document.querySelector('.mobile-print')%3Bdocument.querySelector('.countdown').classList.remove('hide')%3Bdocument.querySelector('.redeem-section').classList.add('hide')%3Bdocument.querySelector('.mobile-details.redeemed').classList.add('hide')%3BcouponElement.classList.remove('hide')%3Bconst%20msToClock%20%3D%20(ms)%20%3D%3E%20%7Bconst%20minutes%20%3D%20Math.floor(ms%20%2F%2060000)%3Bconst%20seconds%20%3D%20((ms%20%25%2060000)%20%2F%201000).toFixed(0)%3Breturn%20minutes%20%2B%20%22%3A%22%20%2B%20(seconds%20%3C%2010%20%3F%20'0'%20%3A%20'')%20%2B%20seconds%3B%7D%3Blet%20countdown%20%3D%201080000%3BsetInterval(()%20%3D%3E%20document.querySelector('.clock').innerHTML%20%3D%20msToClock(countdown%20-%3D%20500)%2C%20500)%3Bconst%20sampleDiv%20%3D%20document.createTextNode('---%20COUPON%20NOT%20VALID%2C%20DO%20NOT%20REDEEM%20---')%3BcouponElement.parentNode.insertBefore(sampleDiv%2C%20couponElement.nextSibling)%3Bdocument.querySelector('.redeem-mobile-coupon').prepend(sampleDiv)%3B%7D)()%7D)()
```

Once this is done, you can now go to the coupon site on your mobile phone and toggle the UI to reveal the coupon. Again, **do not redeem** a free root beer with this coupon. And there is a sample text I injected in there to prevent usage.

## The better approach:
The safer approach is to hide the coupon from plain sight, and then bring it to the front end only when the user asks for it. During the request, the backend can check for eligibility and then send the appropriate response back to the client. At the moment the site just bounces the user back to the home page, which is not the best UX as well because the user is not infomred why they get landed back at home page when their intent was clicking (tapping) on the "Redeem" button. An error message indicating the coupon is not valid (or already claimed) would be better.

If we establish the user profile at the backend similar to the following setup, then we can limit the customer's coupon usage. Additionally, we can establish the building blocks necessary for business intelligence to eventually analyze coupon popularities:

```
{
  "id": "123456789",
  "signUpLocation": "Edmonton",
  "allowMarketingEmails": true,
  "email": "fff57b27974ad380e2ecea2b01bcabd0",
  "signUpTime": 1563972215478,
  "coupons": [
    {
      "freeRootBeer": {
        "used": true,
        "lastUsed": 1563972594618
      }
    }
  ]
}
```

Once the backend starts sending the appropriate response, the front end then could react to whatever payload it receives and render the UI accordingly.

A more complex approach is to generate a unique coupon code for every customer, but this involve more data storage and services to build around the tracking of user-to-coupon relationships. With more upfront engineering investments however, it could yield even more business insights as we could gain information on the our customer's journey starting from the coupon request, all the way to the time and the exact POS they've redeem the deal. We can also see the food they (anonymously) have ordered that goes along with the free root beer. With these valuable information, businesses could utilize them to optimize, experiment, and eliminate waste at their stores and menus to gain bottom line lifts from customer orders.

## Bottom Line:
**DO NOT USE THIS METHOD TO GAIN FREE DRINKS**

This write-up expresses my opinion on the technical implementation as seen on awcoupon.ca along with my humble suggestion on how to make it work better. It's understandable businesses may not always want to invest heavily on small marketing efforts so this coupon setup may not need done using *the best* approach. As a developer, I just wished to see a better implementation and something that is less easy to exploit than just toggling the visibility on & off using a css class.

I have redeemed a free drink once using the coupon legitimately, but I have not claimed any free root beers using this script at all whatsoever. And I don't encourage people to use this script to do the same.

Seeing the page refresh each subsequent time I try to reveal the coupon got myself curious on the implementation. My intent is to educate other fellow developers with this article to design a better solution when it comes to revenue-sensitive business solutions.
