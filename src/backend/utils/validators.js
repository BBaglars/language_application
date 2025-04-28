const { body, validationResult } = require('express-validator');

const userValidators = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Kullanıcı adı 3-20 karakter arasında olmalıdır'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Geçerli bir email adresi giriniz'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Şifre en az 6 karakter olmalıdır')
            .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
            .withMessage('Şifre en az bir harf ve bir rakam içermelidir')
    ],
    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Geçerli bir email adresi giriniz'),
        body('password')
            .notEmpty()
            .withMessage('Şifre gereklidir')
    ]
};

const wordValidators = {
    create: [
        body('word')
            .trim()
            .notEmpty()
            .withMessage('Kelime gereklidir'),
        body('meaning')
            .trim()
            .notEmpty()
            .withMessage('Anlam gereklidir'),
        body('categoryId')
            .isInt()
            .withMessage('Geçerli bir kategori ID\'si giriniz')
    ]
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    userValidators,
    wordValidators,
    validate
}; 