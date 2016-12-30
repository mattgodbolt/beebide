NPM_UP_TO_DATE:=.npm-up-to-date
BOWER_UP_TO_DATE:=.npm-up-to-date
NODE:=node
NPM:=npm

all: test

npm: $(NPM_UP_TO_DATE)
bower: $(BOWER_UP_TO_DATE)

$(NPM_UP_TO_DATE): package.json
	$(NPM) install
	touch $(NPM_UP_TO_DATE)

$(BOWER_UP_TO_DATE): bower.json 
	./node_modules/.bin/bower update

clean:
	@rm -rf out

spotless: clean
	@rm -f $(NPM_UP_TO_DATE) $(BOWER_UP_TO_DATE)

test: short-tests long-tests

.PHONY: test npm bower all dist clean spotless
