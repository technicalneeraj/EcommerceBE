const EMAIL_SUBJECTS = {
    SIGNUP: "Your OTP for myApp",
    FORGOT_PASSWORD: "Your OTP for resetting password",
};
const OTP_EXPIRATION_TIME = 10 * 60 * 1000;

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    CONFLICT:409,
    GONE:410,
    LOCKED:423
};


module.exports = {
    EMAIL_SUBJECTS,
    OTP_EXPIRATION_TIME,
    HTTP_STATUS
};