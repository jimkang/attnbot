HOMEDIR = $(shell pwd)
GITDIR = /var/repos/not-an-alien-bot.git

test:
	node tests/mishear-tests.js

start:
	psy start -n not-an-alien-bot -- node not-an-alien-bot.js

stop:
	psy stop not-an-alien-bot || echo "Non-zero return code is OK."

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

post-receive: sync-worktree-to-git npm-install stop start

pushall:
	git push origin master && npm publish

try:
	node tools/run-mishear-text.js "$(TEXT)"

run-mishear-popular:
	node mishear-popular-tweet.js
