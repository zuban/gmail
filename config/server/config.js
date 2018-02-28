// dev stands
const baseDomain = 'http://207.154.201.174';

module.exports = {
    recaptchaKey: '6Le47CIUAAAAAMKwgh30J-rgC3zVISZSXAxdgZoG',
    strictCSP: {
        appDomain: `${baseDomain} 'self'`,
        apiDomain: `${baseDomain} 'self'`,
    },
};
