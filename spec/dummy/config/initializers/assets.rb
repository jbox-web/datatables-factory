# frozen_string_literal: true

# Serve the compiled JS from the gem root
Rails.application.config.assets.paths << Rails.root.join('..', '..', 'dist', 'js')
Rails.application.config.assets.precompile += %w[datatables-factory.js]
