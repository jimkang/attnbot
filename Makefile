HOMEDIR = $(shell pwd)
GITDIR = /var/repos/mishearing-bot.git

test:
	node tests/mishear-tests.js

start:
	psy start -n mishearing-bot -- node mishearing-bot.js

stop:
	psy stop mishearing-bot || echo "Non-zero return code is OK."

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

post-receive: sync-worktree-to-git npm-install stop start

pushall:
	git push origin master && npm publish
