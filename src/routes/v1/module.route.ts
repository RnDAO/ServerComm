import express from 'express';
import { moduleController } from '../../controllers';
import { moduleValidation } from '../../validations';

import { auth, validate } from '../../middlewares';
const router = express.Router();

// Routes
router
    .route('/')
    .post(auth('admin'), validate(moduleValidation.createModule), moduleController.createModule)
    .get(auth('admin'), validate(moduleValidation.getModules), moduleController.getModules);

router
    .route('/:moduleId')
    .get(auth('admin'), validate(moduleValidation.getModule), moduleController.getModule)
    // .patch(auth('admin'), validate(platformValidation.dynamicUpdatePlatform), platformController.updatePlatform)
    .delete(auth('admin'), validate(moduleValidation.deleteModule), moduleController.deleteModule);

export default router;
