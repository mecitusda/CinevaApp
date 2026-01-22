const express = require('express');
const router = express.Router();
const ctrl = require('./series.controller');

router.get('/detail/:id', ctrl.detail);
router.get("/:id/trailer", ctrl.trailer);
router.get("/:id/similar", ctrl.similar);
router.get("/", ctrl.getSeries);


module.exports = router;
