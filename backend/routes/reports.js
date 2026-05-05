
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
    
    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Start date and end date are required' 
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        error: 'Start date must be before end date' 
      });
    }

    // Get requesting user's role
    const requestingUserRole = await getUserRole(requestingUserId);
    
    // Check authorization
    const authResult = await authorizeReportAccess(
      requestingUserId,
      requestingUserRole,
      targetUserId
    );

    if (!authResult.authorized) {
      return res.status(403).json({ 
        error: 'Not authorized to generate this report',
        reason: authResult.reason
      });
    }

    // Get target user info
    const userInfo = await getUserInfo(targetUserId);

    // Generate PDF report
    const pdfBuffer = await generateReport(
      targetUserId,
      startDate,
      endDate,
      userInfo,
      includeCharts || false
    );

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="AfyaFit-Report-${userInfo.name.replace(/\s+/g, '-')}-${startDate}-to-${endDate}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error.message 
    });
  }
});

module.exports = router;
