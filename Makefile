mocha=./node_modules/mocha/bin/mocha --recursive
folders=logger
dirs=$(addprefix test/,$(folders))
.PHONY: test $(folders) cover
test: $(folders)

logger:
	@$(mocha) test/lib/logger
