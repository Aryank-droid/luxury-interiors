require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ===== RATE LIMITING =====
const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many requests. Please try again after 15 minutes.'
    }
});

// ===== MONGODB CONNECTION =====
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.log('❌ MongoDB Error:', err));

// ===== CONSULTATION SCHEMA =====
const consultationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    propertyType: {
        type: String,
        enum: ['Apartment', 'Villa', 'Penthouse', 'Office', 'Restaurant', 'Showroom', 'Hotel', 'Other'],
    },
    propertySize: String,
    serviceRequired: String,
    budget: String,
    designStyle: String,
    timeline: String,
    requirements: {
        type: String,
        required: true
    },
    hearAboutUs: String,
    status: {
        type: String,
        enum: ['New', 'Contacted', 'In Progress', 'Completed', 'Cancelled'],
        default: 'New'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String
});

const Consultation = mongoose.model('Consultation', consultationSchema);

// ===== EMAIL TRANSPORTER =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===== EMAIL TO OWNER =====
async function sendOwnerEmail(data) {
    const mailOptions = {
        from: `"Luxury Interior Website" <${process.env.EMAIL_USER}>`,
       to: `${process.env.OWNER_EMAIL}`,
        subject: `🏠 New Consultation Request from ${data.fullName}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 650px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #1a1a1a, #333); padding: 40px; text-align: center; }
                .header h1 { color: #c9a96e; font-size: 28px; margin: 0 0 5px; }
                .header p { color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; }
                .badge { display: inline-block; background: #c9a96e; color: #1a1a1a; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
                .body { padding: 40px; }
                .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #c9a96e; margin-bottom: 20px; border-bottom: 2px solid #f0e8d8; padding-bottom: 10px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
                .info-box { background: #f9f6f0; padding: 15px; border-radius: 8px; border-left: 4px solid #c9a96e; }
                .info-box .label { font-size: 11px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 5px; }
                .info-box .value { font-size: 15px; color: #333; font-weight: 600; }
                .requirements-box { background: #f9f6f0; padding: 20px; border-radius: 8px; border-left: 4px solid #c9a96e; margin-bottom: 30px; }
                .requirements-box p { color: #555; line-height: 1.7; margin: 0; }
                .actions { text-align: center; margin-bottom: 30px; }
                .btn { display: inline-block; padding: 12px 30px; border-radius: 5px; font-size: 14px; font-weight: bold; text-decoration: none; margin: 5px; }
                .btn-call { background: #25D366; color: white; }
                .btn-email { background: #c9a96e; color: #1a1a1a; }
                .footer { background: #1a1a1a; padding: 20px; text-align: center; }
                .footer p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0; }
                @media (max-width: 480px) { .info-grid { grid-template-columns: 1fr; } }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>LUXURY INTERIOR</h1>
                    <p>New Consultation Request Received</p>
                    <span class="badge">🔔 ACTION REQUIRED</span>
                </div>
                <div class="body">
                    <p class="section-title">👤 Client Information</p>
                    <div class="info-grid">
                        <div class="info-box">
                            <div class="label">Full Name</div>
                            <div class="value">${data.fullName}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Phone Number</div>
                            <div class="value"><a href="tel:${data.phone}" style="color:#c9a96e;">${data.phone}</a></div>
                        </div>
                        <div class="info-box">
                            <div class="label">Email Address</div>
                            <div class="value"><a href="mailto:${data.email}" style="color:#c9a96e;">${data.email}</a></div>
                        </div>
                        <div class="info-box">
                            <div class="label">City / Location</div>
                            <div class="value">${data.city || 'Not specified'}</div>
                        </div>
                    </div>

                    <p class="section-title">🏠 Property Details</p>
                    <div class="info-grid">
                        <div class="info-box">
                            <div class="label">Property Type</div>
                            <div class="value">${data.propertyType || 'Not specified'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Property Size</div>
                            <div class="value">${data.propertySize || 'Not specified'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Service Required</div>
                            <div class="value">${data.serviceRequired || 'Not specified'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Budget Range</div>
                            <div class="value">${data.budget || 'Not specified'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Design Style</div>
                            <div class="value">${data.designStyle || 'Not specified'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Timeline</div>
                            <div class="value">${data.timeline || 'Not specified'}</div>
                        </div>
                    </div>

                    <p class="section-title">💬 Client Requirements</p>
                    <div class="requirements-box">
                        <p>${data.requirements}</p>
                    </div>

                    <p class="section-title">📊 Additional Info</p>
                    <div class="info-grid">
                        <div class="info-box">
                            <div class="label">Heard About Us</div>
                            <div class="value">${data.hearAboutUs || 'Not specified'}</div>
                        </div>
                        <div class="info-box">
                            <div class="label">Submitted At</div>
                            <div class="value">${new Date().toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    <div class="actions">
                        <a href="tel:${data.phone}" class="btn btn-call">📞 Call Client Now</a>
                        <a href="mailto:${data.email}" class="btn btn-email">✉️ Email Client</a>
                    </div>
                </div>
                <div class="footer">
                    <p>© 2025 Luxury Interior | Contact: +91 96641 41944 | +91 87798 41253</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
}

// ===== EMAIL TO CLIENT =====
async function sendClientEmail(data) {
    const mailOptions = {
        from: `"Luxury Interior" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `✨ Thank You ${data.fullName} - Your Consultation Request Received!`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #1a1a1a, #333); padding: 50px 40px; text-align: center; }
                .header h1 { color: #c9a96e; font-size: 32px; margin: 0 0 5px; letter-spacing: 3px; }
                .header p { color: rgba(255,255,255,0.7); margin: 0; }
                .icon { font-size: 50px; margin-bottom: 15px; }
                .body { padding: 40px; }
                .greeting { font-size: 22px; color: #1a1a1a; margin-bottom: 15px; }
                .message { color: #666; line-height: 1.8; margin-bottom: 25px; }
                .summary { background: #f9f6f0; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-top: 3px solid #c9a96e; }
                .summary h3 { color: #c9a96e; margin: 0 0 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
                .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ece8e0; font-size: 14px; }
                .summary-item:last-child { border: none; }
                .summary-item .key { color: #999; }
                .summary-item .val { color: #333; font-weight: 600; }
                .steps { margin-bottom: 30px; }
                .step { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; }
                .step-num { background: #c9a96e; color: #1a1a1a; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; }
                .step-text h4 { margin: 0 0 5px; color: #333; font-size: 15px; }
                .step-text p { margin: 0; color: #888; font-size: 13px; }
                .contact-box { background: #1a1a1a; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
                .contact-box p { color: rgba(255,255,255,0.7); margin: 0 0 15px; font-size: 14px; }
                .contact-number { color: #c9a96e; font-size: 20px; font-weight: bold; margin: 5px 0; }
                .footer-section { background: #f9f6f0; padding: 25px; text-align: center; }
                .social-links a { display: inline-block; margin: 0 8px; color: #c9a96e; font-size: 20px; }
                .footer-bottom { background: #1a1a1a; padding: 15px; text-align: center; }
                .footer-bottom p { color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="icon">✨</div>
                    <h1>LUXURY INTERIOR</h1>
                    <p>Premium Interior Design Studio</p>
                </div>
                <div class="body">
                    <h2 class="greeting">Dear ${data.fullName},</h2>
                    <p class="message">Thank you for reaching out to <strong>Luxury Interior</strong>! We have successfully received your consultation request and are thrilled about the opportunity to transform your space into something extraordinary.</p>
                    <p class="message">Our expert design team will review your requirements and contact you within <strong style="color:#c9a96e;">24 hours</strong>.</p>

                    <div class="summary">
                        <h3>📋 Your Request Summary</h3>
                        <div class="summary-item">
                            <span class="key">Property Type</span>
                            <span class="val">${data.propertyType || '—'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="key">Service Required</span>
                            <span class="val">${data.serviceRequired || '—'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="key">Budget Range</span>
                            <span class="val">${data.budget || '—'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="key">Design Style</span>
                            <span class="val">${data.designStyle || '—'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="key">Timeline</span>
                            <span class="val">${data.timeline || '—'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="key">Submitted On</span>
                            <span class="val">${new Date().toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div class="steps">
                        <h3 style="color:#1a1a1a; margin-bottom:20px;">🚀 What Happens Next?</h3>
                        <div class="step">
                            <div class="step-num">1</div>
                            <div class="step-text">
                                <h4>Team Review</h4>
                                <p>Our design team will carefully review your requirements and vision.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-num">2</div>
                            <div class="step-text">
                                <h4>Personal Call</h4>
                                <p>A senior designer will call you within 24 hours to discuss your project.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-num">3</div>
                            <div class="step-text">
                                <h4>Site Visit</h4>
                                <p>We'll schedule a free site visit to understand your space better.</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-num">4</div>
                            <div class="step-text">
                                <h4>Custom Proposal</h4>
                                <p>We'll present a customized design proposal tailored to your vision.</p>
                            </div>
                        </div>
                    </div>

                    <div class="contact-box">
                        <p>Need to speak with us immediately? Call us now:</p>
                        <div class="contact-number">📞 +91 96641 41944</div>
                        <div class="contact-number">📞 +91 87798 41253</div>
                        <p style="margin-top:10px; font-size:12px;">Mon - Sat | 10:00 AM - 7:00 PM</p>
                    </div>
                </div>
                <div class="footer-section">
                    <p style="color:#999; font-size:13px; margin-bottom:10px;">Follow us for design inspiration</p>
                    <div class="social-links">
                        <a href="#">📷</a>
                        <a href="#">👥</a>
                        <a href="#">📌</a>
                        <a href="#">▶️</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© 2025 Luxury Interior | luxuryinterior.com | Unsubscribe</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
}

// ===== API ROUTES =====

// Submit Consultation
app.post('/api/consultation', formLimiter, async (req, res) => {
    try {
        const {
            fullName, email, phone, city,
            propertyType, propertySize, serviceRequired,
            budget, designStyle, timeline,
            requirements, hearAboutUs
        } = req.body;

        // Validation
        if (!fullName || !email || !phone || !requirements) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields.'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        if (!validator.isMobilePhone(phone, 'en-IN')) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number.'
            });
        }

        // Save to Database
        const consultation = new Consultation({
            fullName, email, phone, city,
            propertyType, propertySize, serviceRequired,
            budget, designStyle, timeline,
            requirements, hearAboutUs,
            ipAddress: req.ip
        });

        await consultation.save();

        // Send Emails
        await sendOwnerEmail(req.body);
        await sendClientEmail(req.body);

        res.status(200).json({
            success: true,
            message: 'Consultation request submitted successfully!',
            id: consultation._id
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Get All Consultations (Admin)
app.get('/api/consultations', async (req, res) => {
    try {
        const consultations = await Consultation.find()
            .sort({ submittedAt: -1 });
        res.json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get Stats
app.get('/api/stats', async (req, res) => {
    try {
        const total = await Consultation.countDocuments();
        const today = await Consultation.countDocuments({
            submittedAt: {
                $gte: new Date(new Date().setHours(0,0,0,0))
            }
        });
        const newRequests = await Consultation.countDocuments({ status: 'New' });

        res.json({
            success: true,
            data: { total, today, newRequests }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve Main Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER}`);
    console.log(`📱 Owner: ${process.env.OWNER_PHONE}`);
});