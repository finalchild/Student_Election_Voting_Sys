import * as Router from 'koa-router';
import closePollRouter from './closePollRouter';
import generateKeysRouter from './generateKeysRouter';
import getOldPollRouter from './getOldPollRouter';
import initializePollRouter from './initializePollRouter';
import listOldPollsRouter from './listOldPollsRouter';
import openPollRouter from './openPollRouter';
import setAdminPwRouter from './setAdminPwRouter';
import statusRouter from './statusRouter';

const router = new Router({prefix: '/admin'});
export default router;

router.use(closePollRouter.routes());
router.use(closePollRouter.allowedMethods());
router.use(generateKeysRouter.routes());
router.use(generateKeysRouter.allowedMethods());
router.use(getOldPollRouter.routes());
router.use(getOldPollRouter.allowedMethods());
router.use(initializePollRouter.routes());
router.use(initializePollRouter.allowedMethods());
router.use(listOldPollsRouter.routes());
router.use(listOldPollsRouter.allowedMethods());
router.use(openPollRouter.routes());
router.use(openPollRouter.allowedMethods());
router.use(setAdminPwRouter.routes());
router.use(setAdminPwRouter.allowedMethods());
router.use(statusRouter.routes());
router.use(statusRouter.allowedMethods());
