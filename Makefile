################
# Public tasks #
################

# This is the default task
all: help

setup: ## Setup local environment
	asdf plugin add nodejs   || true
	asdf plugin add yarn     || true
	asdf install
	asdf current

deps: ## Install dependencies
	yarn install

build: ## Build JS
	yarn webpack


.PHONY: all setup deps build


#################
# Private tasks #
#################

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: help
