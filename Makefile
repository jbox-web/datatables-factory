################
# Public tasks #
################

# This is the default task
all: help

deps: ## Install dependencies
	yarn install


build: ## Build JS
	yarn webpack


#################
# Private tasks #
#################

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
