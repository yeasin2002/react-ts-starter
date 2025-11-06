// PM2 configuration for running Nitro server
module.exports = {
  apps: [
    {
      name: "nitro-server",
      script: ".output/server/index.mjs",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        NITRO_PORT: 3000,
        NITRO_HOST: "127.0.0.1",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
