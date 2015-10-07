FROM nodesource/trusty:4.1.1

# Add your source files
# cwd is /usr/src/app
# cache package.json (included in .) and node_modules to speed up builds
ADD . .
RUN npm install

CMD ["crontab", "/usr/src/app/mishearing-bot/schedule.cron"]
