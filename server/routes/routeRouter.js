import { Router } from 'express';
import { routeController } from '../controllers/routeController.js';

const router = Router();

router.post('/plan', routeController.planRoute);
router.post('/stops/suggest', routeController.suggestStops);

export default router;