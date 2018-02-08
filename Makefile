mocha=./node_modules/mocha/bin/mocha --recursive
folders=logger root
files=address asyncPromiseHandler mocker validator bbcodeConverter.js
paths=$(addprefix test/lib/,$(files))
dirs=$(paths) test/lib/logger
.PHONY: test $(folders) cover
test: $(folders)

logger:
	@$(mocha) test/lib/logger
root:
	@$(mocha) $(path)

jenkins:
	@$(mocha) --reporter mocha-jenkins-reporter --colors --reporter-options junit_report_path=./test-reports/report.xml $(dirs)
