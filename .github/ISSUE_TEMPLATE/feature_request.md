name: Feature Request
description: Suggest a new feature or enhancement
title: "[FEATURE] "
labels: ["enhancement"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for suggesting an improvement! Please provide details about your feature request.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Clear description of the feature you'd like to see
      placeholder: Describe the feature...
    validations:
      required: true

  - type: textarea
    id: use-case
    attributes:
      label: Use Case
      description: Why would this feature be useful?
      placeholder: Explain the problem this solves...
    validations:
      required: true

  - type: textarea
    id: implementation
    attributes:
      label: Proposed Implementation
      description: How do you think this could be implemented? (optional)
      placeholder: Your ideas on how to implement this...

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Are there any alternative solutions or features you've considered?
      placeholder: List any alternatives...

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any extra information that might be helpful
      placeholder: Additional context...
