# alexa_linkedAccountTwitterNodeJs

example nodejs alexa linked account skill function runs on amazon lambda
a basic currecy converter application asks EUR/USD, then converts it to TRY. if user wants, it tweets the result to twitter.

C# version of same alexa-skill: **alexa_linkedAccountTwitter.NET**

**features:**
- uses a middleware to obtain access token from 3rd party such as twitter
- uses session flow to maintain dialogue with user
- connects an API to get an info to calculate