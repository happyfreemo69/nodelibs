mocha=./node_modules/mocha/bin/mocha --recursive
folders=logger root
files=address asyncPromiseHandler mocker validator
paths=$(addprefix test/lib/,$(files))
.PHONY: test $(folders) cover
test: $(folders)

logger:
	@$(mocha) test/lib/logger
root:
	@$(mocha) $(path)