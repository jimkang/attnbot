FROM nodesource/trusty:4.1.1

# Add your source files
# cwd is /usr/src/app
# cache package.json (included in .) and node_modules to speed up builds
ADD . .
RUN npm install

# Add crontab file in the cron directory
ADD schedule.cron /etc/cron.d/paying-attention-bot.cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/paying-attention-bot.cron
 
# Create the log file to be able to run tail
# RUN touch /var/log/cron.log
 
# Run the command on container startup
CMD ["cron", "-f"]
