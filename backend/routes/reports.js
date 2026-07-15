const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generateReport } = require('../services/pdfGeneratorService');
const { authorizeReportAccess, getUserRole, getUserInfo } = require('../utils/reportAuthHelper');

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { userId, startDate, endDate, includeCharts } = req.body;
    const requestingUserId = req.user.id;
    const targetUserId = userId || requestingUserId;

    if (!startDate || !endDate)
      return res.status(400).json({ error: 'Start date and end date are required' });

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate))
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });

    if (new Date(startDate) > new Date(endDate))
      return res.status(400).json({ error: 'Start date must be before end date' });

    const requestingUserRole = await getUserRole(requestingUserId);
    const authResult = await authorizeReportAccess(requestingUserId, requestingUserRole, targetUserId);

    if (!authResult.authorized)
      return res.status(403).json({ error: 'Not authorized to generate this report', reason: authResult.reason });

    const userInfo = await getUserInfo(targetUserId);
    const pdfBuffer = await generateReport(targetUserId, startDate, endDate, userInfo, includeCharts || false);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AfyaFit-Report-${userInfo.name.replace(/\s+/g, '-')}-${startDate}-to-${endDate}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    if (error.message === 'User not found')
      return res.status(404).json({ error: 'User not found' });
    res.status(500).json({ error: 'Failed to generate report', message: error.message });
  }
});

module.exports = router;
