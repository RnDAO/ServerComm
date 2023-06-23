import express from "express";
import { memberActivityController } from "../../controllers";
import { memberActivityValidation } from '../../validations';

import { validate, auth } from '../../middlewares';
const router = express.Router();

// Routes
router.post('/:guildId/active-members-composition-line-graph', auth(), validate(memberActivityValidation.activeMembersCompositionLineGraph), memberActivityController.activeMembersCompositionLineGraph);
router.post('/:guildId/active-members-onboarding-line-graph', auth(), validate(memberActivityValidation.activeMembersOnboardingLineGraph), memberActivityController.activeMembersOnboardingLineGraph);
router.post('/:guildId/disengaged-members-composition-line-graph', auth(), validate(memberActivityValidation.disengagedMembersCompositionLineGraph), memberActivityController.disengagedMembersCompositionLineGraph);
router.post('/:guildId/inactive-members-line-graph', auth(), validate(memberActivityValidation.inactiveMembersLineGraph), memberActivityController.inactiveMembersLineGraph);
router.get('/:guildId/members-interactions-network-graph', auth(), validate(memberActivityValidation.memberInteractionsGraph), memberActivityController.membersInteractionsNetworkGraph)
router.post('/:guildId/active-members-composition-table', auth(), validate(memberActivityValidation.activeMembersCompositionTable), memberActivityController.activeMembersCompositionTable);

export default router;

