HOMEDIR = $(shell pwd)
GITDIR = /Users/jimkang/gcw/paying-attention-bot.git

test:
	node tests/get-sentences-from-article-tests.js

start:
	psy start -n paying-attention-bot -- node paying-attention-bot.js

stop:
	psy stop paying-attention-bot || echo "Non-zero return code is OK."

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

post-receive: sync-worktree-to-git npm-install

pushall: build-docker-image push-docker-image
	git push origin master

try:
	node tools/run-mishear-text.js "$(TEXT)"

mishear-popular:
	node mishear-popular-tweet.js

mishear-fact:
	node mishear-fact.js

build-quotes-offsets:
	./node_modules/.bin/get-file-line-offsets-in-json data/quotes_all.csv \
		> data/quotes-offsets.json

mishear-quote:
	node mishear-quote.js

mishear-news:
	node mishear-news.js

mishear-shakespeare:
	node mishear-shakespeare.js

mishear-bible:
	node mishear-bible.js

run-note-taker:
	psy start --name note-taker node take-a-note-bot.js

run-api:
	psy start --name mishear-api node mishearing-web-server.js

stop-docker-machine:
	docker-machine stop dev

start-docker-machine:
	docker-machine start dev

create-docker-machine:
	docker-machine create --driver virtualbox dev

connect-to-docker-machine:
	eval "$(docker-machine env dev)"

build-docker-image:
	docker build -t jkang/attnbot .

push-docker-image:
	docker push jkang/attnbot

#save-docker-image:
#	docker commit 16498c232572

#tag-docker-image:
#	docker tag a6c460bacf99 jkang/attnbot

run-docker-image:
	docker run -v $(HOMEDIR)/config:/usr/src/app/config \
		jkang/attnbot make run-mishear-quote

