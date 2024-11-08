const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Menu",
    options: [
      { label: "View Item List", link: "/items" },
      { label: "Rate Rented Items", link: "/rate-items?renter_id=1" },
      { label: "Log Out", link: "/logout" }
    ]
  });
});

module.exports = router;
