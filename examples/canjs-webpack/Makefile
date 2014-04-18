.PHONY: webpack
webpack: bundle.js

bundle.js: index.js
	webpack -c --progress index.js bundle.js

.PHONY: clean
clean:
	-rm -rf bundle.js
