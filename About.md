A few links:
web app + server repo: https://github.com/zuban/gmail
react native app repo: https://github.com/zuban/gmail-react-native
live app: http://128.199.252.18:8080/

Hi! It is a little description.
After a closer look at the design, I understand, that web app we need more data in the JSON, than in the mobile app(field “1 Oct 2015” is not present in the mobile markup). So, I decide to use graphql + Apollo client for this test application. And I think single endpoint is better to maintain in the future.

I use react SSR and nodejs graphql server. In the production mode, I use PM2 process manager in the docker container. I love to deploy all my tests applications to the DigitalOcean, and with docker-compose, it took about 20 minutes of time to create the simple droplet in Singapore zone and lift up all services. And, of course, I use nginx as reverse proxy ;)

As a UI component library, I use React-Toolbox (https://github.com/react-toolbox/react-toolbox), A set of React components implementing Google's Material Design specification with the power of CSS Modules. To save time, I use a basic style for this MVP.


Docker scripts folder - https://github.com/zuban/gmail/tree/master/docker
PM2 configs - https://github.com/zuban/gmail/tree/master/config/pm2
Graphql server - https://github.com/zuban/gmail/tree/master/%40graphql
Web application -https://github.com/zuban/gmail/tree/master/%40gmail

For the react-native app, I also use Apollo-client. To test application, you need to install expo(https://expo.io/) and scan QR code(check repo README). App sends graphql queries to graphql server(http://128.199.252.18:8080/graphql/)

Developing this app, I was trying to showcase the global understanding of frontend universe. From the step of designing CSS and HTML to final step of deploy and maintain the application in the cloud.

I am ready to answer all your questions ;)
