export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  wx: {
    userAppId: process.env.WX_USER_APPID,
    userSecret: process.env.WX_USER_SECRET,
    coachAppId: process.env.WX_COACH_APPID,
    coachSecret: process.env.WX_COACH_SECRET,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
  },
});
