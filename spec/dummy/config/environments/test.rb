# frozen_string_literal: true

Rails.application.configure do
  config.cache_classes        = true
  config.eager_load           = false
  config.public_file_server.enabled = true
  config.consider_all_requests_local = true
  config.action_dispatch.show_exceptions = :rescuable
  config.assets.digest  = false
  config.assets.compile = true
  config.assets.debug   = true
end
