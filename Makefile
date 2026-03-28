.PHONY: help upload

help:
	@echo "Available targets:"
	@echo "  upload       stage all changes, create commit, and push to origin"

upload:
	@git add .
	@if [ -z "$$(git status --porcelain)" ]; then \
		echo "nothing to upload, working tree clean"; \
	else \
		read -p "Commit message: " msg; \
		if [ -z "$$msg" ]; then \
			echo "aborting: commit message required"; \
			exit 1; \
		fi; \
		git commit -m "$$msg"; \
		git push origin master; \
	fi
