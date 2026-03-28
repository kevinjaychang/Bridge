name: Bug Report
description: Report a bug or issue you've found
title: "[BUG] "
labels: ["bug"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please provide as much detail as possible.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Clear description of what the bug is
      placeholder: Describe the issue...
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the issue
      placeholder: |
        1. Go to...
        2. Click on...
        3. Observe...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should happen instead?
      placeholder: Expected behavior...
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Screenshots or Logs
      description: Add screenshots, code snippets, or error logs if applicable
      placeholder: Paste your logs or describe what you see...

  - type: dropdown
    id: browser
    attributes:
      label: Browser
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Other
    validations:
      required: false

  - type: dropdown
    id: device
    attributes:
      label: Device
      options:
        - Desktop
        - Mobile (specify model)
        - Tablet
    validations:
      required: false

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other information that might be helpful
      placeholder: Additional details...
