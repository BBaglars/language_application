const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../utils/errors.js');

const prisma = new PrismaClient();

const getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                stories: true,
                wordProgress: true,
                gameResults: true,
                generationJobs: true,
                generationCriteria: true
            }
        });

        if (!user) {
            throw new NotFoundError('Kullanıcı bulunamadı');
        }

        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCurrentUser
}; 