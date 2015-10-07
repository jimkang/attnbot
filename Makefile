HOMEDIR = $(shell pwd)
GITDIR = /Users/jimkang/gcw/mishearing-bot.git

test:
	node tests/get-sentences-from-article-tests.js

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

post-receive: sync-worktree-to-git npm-install

pushall:
	git push origin master && git push server master

try:
	node tools/run-mishear-text.js "$(TEXT)"

run-mishear-popular:
	node mishear-popular-tweet.js

run-mishear-fact:
	node mishear-fact.js

build-quotes-offsets:
	./node_modules/.bin/get-file-line-offsets-in-json data/quotes_all.csv \
		> data/quotes-offsets.json

run-mishear-quote:
	node mishear-quote.js

start-docker-machine:
	docker-machine create --driver virtualbox dev

connect-to-docker-machine:
	echo "Run 'eval "$(docker-machine env dev)"'"

build-docker-image:
	docker build .

#save-docker-image:
#	docker commit 16498c232572 localhost:5000:mishearing-bot

#tag-docker-image:
#	docker tag a6c460bacf99 mishearing-bot

run-docker-image:
	docker run -d mishearing-bot
