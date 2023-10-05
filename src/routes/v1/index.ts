import express from 'express';
import docsRoute from './docs.route';
import authRoute from './auth.route';
import guildsRoute from './guilds.route';
import usersRoute from './users.route';
import heatmapsRoute from './heatmaps.route';
import notionRoute from './notion.route';
import memberActivityRoute from './memberActivity.route';
import twitterRoute from './twitter.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/guilds',
    route: guildsRoute,
  },
  {
    path: '/users',
    route: usersRoute,
  },
  {
    path: '/heatmaps',
    route: heatmapsRoute,
  },
  {
    path: '/notion',
    route: notionRoute,
  },
  {
    path: '/member-activity',
    route: memberActivityRoute,
  },
  {
    path: '/twitter',
    route: twitterRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
